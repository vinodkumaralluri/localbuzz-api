import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

// mongoose
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

// Schemas
import { Entity, EntityDocument } from './schemas/entity.schema';
import { User } from '../users/schemas/user.schema';

// Dto
import { EntityDto } from './dto/entity.dto';

// Enum
import { UserType } from 'src/enums/user-type.enum';
import { EntityType } from 'src/enums/entity-type.enum';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';

// Services
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class EntityService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
        private autoIncrementService: AutoIncrementService,
        private roleservice: RolesService,
        private authservice: AuthService,
    ) { }

    // Query Entity
    async queryEntity(filter: any) {
        const entity = await this.entityModel.findOne(filter).exec();
        return entity;
    }

    // Add Entity
    async addEntity(entityDto: EntityDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Entity Id
        const entity_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ENTITY,
            transactionSession,
        );

        var role_id = '';

        // Create Role for the Entity User
        const entityrole = {
            entity_id: entity_id,
            role: UserType.EntityAdmin,
        }

        const entity_role = await this.roleservice.addRole(entityrole, loggedInUser.user_id, transactionSession);

        // Add Permissions to the Entity User Role
        // if (entity_role.status === true) {
        //     role_id = entity_role.data;
        //     var permissions = await this.roleservice.parent_permissions();
        //     try {
        //         const permission = await this.roleService.addPermission(permissions, role_id, loggedInUser.user_id, transactionSession);
        //         if (permission.status === false) {
        //             return { status: false, message: permission.data };
        //         }
        //     } catch (e) {
        //         return { status: false, message: e };
        //     }
        // } else {
        //     await transactionSession.abortTransaction();
        //     return { status: false, data: parent_role.message };
        // }

        // Create User SignUp
        const user = {
            first_name: entityDto.first_name,
            last_name: entityDto.last_name,
            phone_number: entityDto.phone_number,
            email: entityDto.email,
            role_id: role_id,
            user_type: UserType.EntityAdmin,
            password: entityDto.phone_number,
        }
        let usersignup = await this.authservice.signUp(user, transactionSession);

        if (usersignup.status === true) {

            // Check for Entity
            const entitycheck = await this.entityModel
                .findOne({ entity_type: entityDto.entity_type, user_id: usersignup.user_id, status: 1 })
                .exec();
            if (entitycheck) {
                throw new BadRequestException('Entity already exists');
            }

            const entity = new Entity();
            entity.entity_id = entity_id;
            entity.user_id = usersignup.user_id;
            entity.entity_type = entityDto.entity_type;
            entity.created_at = AppUtils.getIsoUtcMoment();
            entity.updated_at = AppUtils.getIsoUtcMoment();
            entity.created_by = loggedInUser.user_id;
            entity.updated_by = loggedInUser.user_id;

            try {
                await this.entityModel.create([entity], { transactionSession });
                    await transactionSession.commitTransaction();
                    return { status: true, data: 'success' };
                } catch (e) {
                    await transactionSession.abortTransaction();
                    return { status: false, data: e };
                } finally {
                    await transactionSession.endSession();
                }
            
        } else {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
            return { status: false, data: 'Failed' };
        } 
    }

    // GET All Entities list
    async getEntities(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.entity_type = { $regex: search };
        }
        const count = await this.entityModel.count(params).exec();
        const list = await this.entityModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Entity by Id
    async getEntityById(id: string, loggedInUser: User) {
        const entity = await this.entityModel
            .findOne({ entity_id: id })
            .exec();
        return entity;
    }

    // Update Entity by Id
    async updateEntity(
        entity_id: string,
        entityDto: EntityDto,
        loggedInUser: User,
    ) {
        const entity = await this.entityModel.findOne({ entity_id }).exec();
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }
        entity.entity_type = entityDto.entity_type;
        entity.updated_at = AppUtils.getIsoUtcMoment();
        entity.updated_by = loggedInUser.user_id;
        return this.entityModel.updateOne({ entity_id }, entity);
    }

    // Delete Entity by Id
    async deleteEntity(entity_id: string, loggedInUser: User) {
        const entity = await this.entityModel.findOne({ entity_id }).exec();
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }
        await this.entityModel.updateOne({ entity_id }, { status: 0 });
        return;
    }

    // Restore Entity by Id
    async restoreEntity(entity_id: string, loggedInUser: User) {
        const entity = await this.entityModel.findOne({ entity_id }).exec();
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }
        await this.entityModel.updateOne({ entity_id }, { status: 1 });
        return;
    }

}






