import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

// Mongoose
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// Schemas
import { Role, RoleDocument } from './schemas/role.schema';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { ModulePermissionsDocument } from './schemas/permission.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { ModuleType } from 'src/enums/module-type.enum';
import { PermissionType } from 'src/enums/permission-type.enum';

// Dto
import { RoleDto } from './dto/role.dto';
import { PermissionDto } from './dto/permission.dto';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
        @InjectConnection() private readonly connection: mongoose.Connection,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Role
    async queryRole(filter: any) {
        const role = await this.roleModel.findOne(filter).exec();
        return role;
    }

    // Add Role
    async addRole(
        roleDto: RoleDto,
        user_id: string,
        session: mongoose.ClientSession | null = null
    ) {
        // Check for Role
        const rolecheck = await this.roleModel
            .findOne({ entity_id: roleDto.entity_id, role: roleDto.role, status: 1 })
            .exec();
        if (rolecheck) {
            console.log(rolecheck)
            throw new BadRequestException('Role already exists');
        }
        // Create Company Role Id
        const role_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ROLE,
            session
        );
        const role = new Role();
        role.role_id = role_id;
        role.entity_id = roleDto.entity_id;
        role.role = roleDto.role;
        role.created_at = AppUtils.getIsoUtcMoment();
        role.updated_at = AppUtils.getIsoUtcMoment();
        role.created_by = user_id;
        role.updated_by = user_id;
        try {
            await this.roleModel.create([role], { session });
            return { status: true, data: role_id, message: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.ROLE);
            return { status: false, data: e, message: 'failure' };
        }
    }

    // GET All Role list
    async getRoles(
        loggedInUser: User,
        school_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { school_id: school_id, status: 1 };
        if (search) {
            params.role = { $regex: search };
        }
        const count = await this.roleModel.count(params).exec();
        const list = await this.roleModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Role by Id
    async getRoleById(id: string, loggedInUser: User) {
        const role = await this.roleModel
            .findOne({ role_id: id })
            .exec();
        return role;
    }

    // GET Role by school_id
    async getRoleByschool_id(school_id: string, usertype: UserType) {
        const role = await this.roleModel
            .findOne({ school_id: school_id, role: usertype, status: 1 })
            .exec();
        return role;
    }

    // Update Role by Id
    async updateRole(
        role_id: string,
        roleDto: RoleDto,
        loggedInUser: User,
    ) {
        const role = await this.roleModel.findOne({ role_id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        role.role = roleDto.role;
        role.updated_at = AppUtils.getIsoUtcMoment();
        role.updated_by = loggedInUser.user_id;
        return this.roleModel.updateOne({ role_id }, role);
    }

    // Delete Role by Id
    async deleteRole(role_id: string, loggedInUser: User) {
        const role = await this.roleModel.findOne({ role_id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        await this.roleModel.updateOne({ role_id }, { status: 0 });
        return;
    }

    // Restore Role by Id
    async restoreRole(role_id: string, loggedInUser: User) {
        const role = await this.roleModel.findOne({ role_id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        await this.roleModel.updateOne({ role_id }, { status: 1 });
        return;
    }

    // Query Company
    async queryPermission(filter: any) {
        const permission = await this.permissionModel.findOne(filter).exec();
        return permission;
    }

    // Add Permission
    async addPermission(
        permissions: any[],
        role_id: string,
        user_id: string,
        session: mongoose.ClientSession | null = null
    ) {
        // Check for Permission
        const permissioncheck = await this.permissionModel
            .findOne({ module_permissions: permissions, role_id: role_id, status: 1 })
            .exec();
        if (permissioncheck) {
            throw new BadRequestException('Permissions already exists');
        }
        // Create Permission Id
        const permission_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.PERMISSION,
            session
        );
        const permission = new Permission();
        permission.permission_id = permission_id;
        permission.role_id = role_id;
        permission.module_permissions = permissions;
        permission.created_at = AppUtils.getIsoUtcMoment();
        permission.updated_at = AppUtils.getIsoUtcMoment();
        permission.created_by = user_id;
        permission.updated_by = user_id;
        try {
            await this.permissionModel.create([permission], { session });
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.PERMISSION);
            return { status: false, data: e };
        }
    }

    // GET All Permissions by Role
    async getPermissions(
        loggedInUser: User,
        role_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { role_id: role_id, status: 1 };
        if (search) {
            params.permission = { $regex: search };
        }
        const count = await this.permissionModel.count(params).exec();
        const list = await this.permissionModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Permission by Id
    async getPermissionById(id: string, loggedInUser: User) {
        const permission = await this.permissionModel
            .findOne({ permission_id: id })
            .exec();
        return permission;
    }

    // Update Permission by Id
    async updatePermission(
        permission_id: string,
        permissions: any[],
        loggedInUser: User,
    ) {
        const permission = await this.permissionModel.findOne({ permission_id }).exec();
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        permission.module_permissions = permissions;
        permission.updated_at = AppUtils.getIsoUtcMoment();
        permission.updated_by = loggedInUser.user_id;
        return this.permissionModel.updateOne({ permission_id }, permission);
    }

    // Delete Permission by Id
    async deletePermission(permission_id: string, loggedInUser: User) {
        const permission = await this.permissionModel.findOne({ permission_id }).exec();
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        await this.permissionModel.updateOne({ permission_id }, { status: 0 });
        return;
    }

    // Restore Permission by Id
    async restorePermission(permission_id: string, loggedInUser: User) {
        const permission = await this.permissionModel.findOne({ permission_id }).exec();
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        await this.permissionModel.updateOne({ permission_id }, { status: 1 });
        return;
    }

    // GET Super Admin Permissions
    // async superadmin_permissions() {
    //     const permissions = [
    //         {
    //             module: ModuleType.School,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Administration,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Students,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Employees,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Attendance,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Academics,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Assessments,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Examinations,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Fee,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Timetable,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Transportation,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //     ];

    //     return permissions;
    // }

    // GET School Admin Permissions
    // async admin_permissions() {
    //     const permissions = [
    //         {
    //             module: ModuleType.School,
    //             permissions: [PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Administration,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Students,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Employees,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Attendance,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Academics,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Assessments,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Examinations,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Fee,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Timetable,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Transportation,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //     ];

    //     return permissions;
    // }

    // GET Branch Admin Permissions
    // async branchAdmin_permissions() {
    //     const permissions = [
    //         {
    //             module: ModuleType.School,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Administration,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Students,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Employees,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Attendance,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Academics,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Assessments,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Examinations,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Fee,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Timetable,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Transportation,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //     ];

    //     return permissions;
    // }

    // GET Employee Permissions
    // async employee_permissions() {
    //     const permissions = [
    //         {
    //             module: ModuleType.School,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Administration,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Students,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Employees,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Attendance,
    //             permissions: [PermissionType.CREATE, PermissionType.VIEW],
    //         },
    //         {
    //             module: ModuleType.Academics,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Assessments,
    //             permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
    //         },
    //         {
    //             module: ModuleType.Examinations,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Fee,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Timetable,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Transportation,
    //             permissions: [PermissionType.VIEW]
    //         },
    //     ];

    //     return permissions;
    // }

    // GET Parent Permissions
    // async parent_permissions() {
    //     const permissions = [
    //         {
    //             module: ModuleType.School,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Administration,
    //             permissions: [PermissionType.NOACCESS]
    //         },
    //         {
    //             module: ModuleType.Students,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Employees,
    //             permissions: [PermissionType.NOACCESS]
    //         },
    //         {
    //             module: ModuleType.Attendance,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Academics,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Assessments,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Examinations,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Fee,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Timetable,
    //             permissions: [PermissionType.VIEW]
    //         },
    //         {
    //             module: ModuleType.Transportation,
    //             permissions: [PermissionType.VIEW]
    //         },
    //     ];

    //     return permissions;
    // }

}
