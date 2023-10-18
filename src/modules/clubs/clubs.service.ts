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
import { Club, ClubDocument } from './schemas/club.schema';
import { User } from '../users/schemas/user.schema';

// Dto
import { ClubDto } from './dto/club.dto';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

// Utils
import { AppUtils } from '../../utils/app.utils';
import { ClubTypes } from 'src/enums/club-types.enum';

@Injectable()
export class ClubsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Club.name) private clubModel: Model<ClubDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Clubs
    async queryClubs(filter: any) {
        const clubs = await this.clubModel.findOne(filter).exec();
        return clubs;
    }

    // Add Club
    async addClub(clubDto: ClubDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Club Id
        const club_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.CLUBS,
            transactionSession,
        );

        // Check for Club
        const clubcheck = await this.clubModel
            .findOne({ name: clubDto.name, status: 1 })
            .exec();
        if (clubcheck) {
            throw new BadRequestException('Club already exists');
        }

        const club = new Club();
        club.club_id = club_id;
        club.name = clubDto.name;
        club.type = clubDto.type;
        club.description = clubDto.description;
        club.club_image = clubDto.club_image;
        club.created_at = AppUtils.getIsoUtcMoment();
        club.updated_at = AppUtils.getIsoUtcMoment();
        club.created_by = loggedInUser.user_id;
        club.updated_by = loggedInUser.user_id;

        try {
            await this.clubModel.create([club], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }

    }

    // GET All Clubs list
    async getClubsList(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.name = { $regex: search };
        }
        const count = await this.clubModel.count(params).exec();
        const list = await this.clubModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET All Clubs by type
    async getClubsByType(
        loggedInUser: User,
        type: ClubTypes,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { type: type, status: 1 };
        if (search) {
            params.name = { $regex: search };
        }
        const count = await this.clubModel.count(params).exec();
        const list = await this.clubModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Club by Id
    async getClubById(id: string, loggedInUser: User) {
        const club = await this.clubModel
            .findOne({ club_id: id })
            .exec();
        return club;
    }

    // Update Club by Id
    async updateClub(
        club_id: string,
        clubDto: ClubDto,
        loggedInUser: User,
    ) {
        const club = await this.clubModel.findOne({ club_id }).exec();
        if (!club) {
            throw new NotFoundException('Club not found');
        }
        club.name = clubDto.name;
        club.type = clubDto.type;
        club.description = clubDto.description;
        club.club_image = clubDto.club_image;
        club.updated_at = AppUtils.getIsoUtcMoment();
        club.updated_by = loggedInUser.user_id;
        return this.clubModel.updateOne({ club_id }, club);
    }

    // Delete Club by Id
    async deleteClub(club_id: string, loggedInUser: User) {
        const club = await this.clubModel.findOne({ club_id }).exec();
        if (!club) {
            throw new NotFoundException('Club not found');
        }
        await this.clubModel.updateOne({ club_id }, { status: 0 });
        return;
    }

    // Restore Club by Id
    async restoreClub(club_id: string, loggedInUser: User) {
        const club = await this.clubModel.findOne({ club_id }).exec();
        if (!club) {
            throw new NotFoundException('Club not found');
        }
        await this.clubModel.updateOne({ club_id }, { status: 1 });
        return;
    }

}






