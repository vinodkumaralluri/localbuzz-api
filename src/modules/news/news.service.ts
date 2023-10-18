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
import { News, NewsDocument } from './schemas/news.schema';
import { User } from '../users/schemas/user.schema';

// Dto
import { NewsDto } from './dto/news.dto';

// Enum
import { UserType } from 'src/enums/user-type.enum';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';

// Services
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { RolesService } from '../roles/roles.service';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class NewsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(News.name) private newsModel: Model<NewsDocument>,
        private autoIncrementService: AutoIncrementService,
        private roleservice: RolesService,
        private authservice: AuthService,
    ) { }

    // Query News
    async queryNews(filter: any) {
        const news = await this.newsModel.findOne(filter).exec();
        return news;
    }

    // Add News
    async addNews(newsDto: NewsDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create News Id
        const news_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.NEWS,
            transactionSession,
        );

        // Check for News
        const newscheck = await this.newsModel
            .findOne({ headlines: newsDto.headlines, content: newsDto.content, status: 1 })
            .exec();
        if (newscheck) {
            throw new BadRequestException('News already exists');
        }

        const news = new News();
        news.news_id = news_id;
        news.headlines = newsDto.headlines;
        news.content = newsDto.content;
        news.content_image = newsDto.content_image;
        news.location = newsDto.location;
        news.location_name = newsDto.location_name;
        news.created_at = AppUtils.getIsoUtcMoment();
        news.updated_at = AppUtils.getIsoUtcMoment();
        news.created_by = loggedInUser.user_id;
        news.updated_by = loggedInUser.user_id;

        try {
            await this.newsModel.create([news], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }

    }

    // GET All News list
    async getNewsList(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.headlines = { $regex: search };
        }
        const count = await this.newsModel.count(params).exec();
        const list = await this.newsModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET All News by Date
    async getNewsByDate(
        loggedInUser: User,
        date: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { date: date, status: 1 };
        if (search) {
            params.headlines = { $regex: search };
        }
        const count = await this.newsModel.count(params).exec();
        const list = await this.newsModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET News by Id
    async getNewsById(id: string, loggedInUser: User) {
        const news = await this.newsModel
            .findOne({ news_id: id })
            .exec();
        return news;
    }

    // Update News by Id
    async updateNews(
        news_id: string,
        newsDto: NewsDto,
        loggedInUser: User,
    ) {
        const news = await this.newsModel.findOne({ news_id }).exec();
        if (!news) {
            throw new NotFoundException('News not found');
        }
        news.headlines = newsDto.headlines;
        news.content = newsDto.content;
        news.content_image = newsDto.content_image;
        news.location = newsDto.location;
        news.location_name = newsDto.location_name;
        news.updated_at = AppUtils.getIsoUtcMoment();
        news.updated_by = loggedInUser.user_id;
        return this.newsModel.updateOne({ news_id }, news);
    }

    // Delete News by Id
    async deleteNews(news_id: string, loggedInUser: User) {
        const news = await this.newsModel.findOne({ news_id }).exec();
        if (!news) {
            throw new NotFoundException('News not found');
        }
        await this.newsModel.updateOne({ news_id }, { status: 0 });
        return;
    }

    // Restore News by Id
    async restoreNews(news_id: string, loggedInUser: User) {
        const news = await this.newsModel.findOne({ news_id }).exec();
        if (!news) {
            throw new NotFoundException('News not found');
        }
        await this.newsModel.updateOne({ news_id }, { status: 1 });
        return;
    }

}






