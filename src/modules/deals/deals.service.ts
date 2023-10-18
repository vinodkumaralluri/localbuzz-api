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
import { Deal, DealDocument } from './schemas/deal.schema';
import { User } from '../users/schemas/user.schema';

// Dto
import { DealDto } from './dto/deal.dto';

// Enum
import { UserType } from 'src/enums/user-type.enum';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class DealsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Deal.name) private dealModel: Model<DealDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Deals
    async queryDeals(filter: any) {
        const deals = await this.dealModel.findOne(filter).exec();
        return deals;
    }

    // Add Deal
    async addDeal(dealDto: DealDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Deal Id
        const deal_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.DEAL,
            transactionSession,
        );

        // Check for Deal
        const dealcheck = await this.dealModel
            .findOne({ entity_id: dealDto.entity_id, product: dealDto.product, deal: dealDto.deal, expiry_date: dealDto.expiry_date, status: 1 })
            .exec();
        if (dealcheck) {
            throw new BadRequestException('Deal already exists');
        }

        const deal = new Deal();
        deal.deal_id = deal_id;
        deal.entity_id = dealDto.entity_id;
        deal.product = dealDto.product;
        deal.deal = dealDto.deal;
        deal.expiry_date = dealDto.expiry_date;
        deal.created_at = AppUtils.getIsoUtcMoment();
        deal.updated_at = AppUtils.getIsoUtcMoment();
        deal.created_by = loggedInUser.user_id;
        deal.updated_by = loggedInUser.user_id;

        try {
            await this.dealModel.create([deal], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }

    }

    // GET All Deals list
    async getDealsList(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.product = { $regex: search };
        }
        const count = await this.dealModel.count(params).exec();
        const list = await this.dealModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET All Deals by Date
    async getDealsByDate(
        loggedInUser: User,
        date: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { created_at: AppUtils.getIsoUtcMoment(date), status: 1 };
        if (search) {
            params.product = { $regex: search };
        }
        const count = await this.dealModel.count(params).exec();
        const list = await this.dealModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Deal by Id
    async getDealById(id: string, loggedInUser: User) {
        const deal = await this.dealModel
            .findOne({ deal_id: id })
            .exec();
        return deal;
    }

    // Update Deal by Id
    async updateDeal(
        deal_id: string,
        dealDto: DealDto,
        loggedInUser: User,
    ) {
        const deal = await this.dealModel.findOne({ deal_id }).exec();
        if (!deal) {
            throw new NotFoundException('Deal not found');
        }
        deal.deal = dealDto.deal;
        deal.expiry_date = dealDto.expiry_date;
        deal.updated_at = AppUtils.getIsoUtcMoment();
        deal.updated_by = loggedInUser.user_id;
        return this.dealModel.updateOne({ deal_id }, deal);
    }

    // Delete Deal by Id
    async deleteDeal(deal_id: string, loggedInUser: User) {
        const deal = await this.dealModel.findOne({ deal_id }).exec();
        if (!deal) {
            throw new NotFoundException('Deal not found');
        }
        await this.dealModel.updateOne({ deal_id }, { status: 0 });
        return;
    }

    // Restore Deal by Id
    async restoreDeal(deal_id: string, loggedInUser: User) {
        const deal = await this.dealModel.findOne({ deal_id }).exec();
        if (!deal) {
            throw new NotFoundException('Deal not found');
        }
        await this.dealModel.updateOne({ deal_id }, { status: 1 });
        return;
    }

}






