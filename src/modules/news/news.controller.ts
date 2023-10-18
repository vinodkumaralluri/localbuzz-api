import {
    Body,
    Controller,
    Param,
    Post,
    Put,
    Delete,
    UseGuards,
    UseInterceptors,
    Request,
    Get,
    Query,
    NotImplementedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NewsDto } from './dto/news.dto';
import { NewsService } from './news.service';

@Controller({
    path: 'news',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('News')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class NewsController {
    constructor(private readonly newsservice: NewsService) { }

    // Add News
    @Post('/addNews')
    @ApiOperation({ summary: 'Add News' })
    @ApiOkResponse({
        description: 'News added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addNews(@Body() newsDto: NewsDto, @Request() req) {
        const news = await this.newsservice.addNews(
            newsDto,
            req.user,
        );
        if (news.status == true) {
            return { status: true, message: 'News added successfully' };
        } else {
            throw new NotImplementedException(news.status);
        }
    }

    // Update News
    @Put('/editNews/:news_id')
    @ApiOperation({ summary: 'Update News' })
    @ApiOkResponse({
        description: 'News updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateNews(
        @Request() req,
        @Param('news_id') news_id: string,
        @Body() newsDto: NewsDto,
    ) {
        await this.newsservice.updateNews(
            news_id,
            newsDto,
            req.user,
        );
        return { status: true, message: 'News updated successfully', data: true };
    }

    // GET All News list
    @Get('/getNewsList')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get News' })
    @ApiOkResponse({
        description: 'News fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getNewsList(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const newslist = await this.newsservice.getNewsList(
            req.user,
            page,
            limit,
            search,
        );
        return { status: true, message: 'News fetched successfully', data: newslist };
    }

    // GET All News by Date
    @Get('/getNewsByDate/:date')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get News by Date' })
    @ApiOkResponse({
        description: 'News fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getNewsByDate(
        @Request() req,
        @Param('date') date: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const newslist = await this.newsservice.getNewsByDate(
            req.user,
            date,
            page,
            limit,
            search,
        );
        return { status: true, message: 'News fetched successfully', data: newslist };
    }

    // GET News by Id
    @Get('/getNewsById/:news_id')
    @ApiOperation({ summary: 'Get News By Id' })
    @ApiOkResponse({
        description: 'News fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getNewsById(
        @Request() req,
        @Param('news_id') news_id: string,
    ) {
        const news = await this.newsservice.getNewsById(
            news_id,
            req.user,
        );
        return { status: true, message: 'News fetched successfully', data: news };
    }

    // Delete News
    @Delete('/deleteNews/:news_id')
    @ApiOperation({ summary: 'Delete News' })
    @ApiOkResponse({
        description: 'News deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteNews(
        @Request() req,
        @Param('news_id') news_id: string
    ) {
        await this.newsservice.deleteNews(
            news_id,
            req.user,
        );
        return { message: 'News deleted successfully', data: true };
    }

    // Restore News
    @Delete('/restoreNews/:news_id')
    @ApiOperation({ summary: 'Restore News' })
    @ApiOkResponse({
        description: 'News restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreNews(
        @Request() req,
        @Param('news_id') news_id: string,
    ) {
        await this.newsservice.restoreNews(
            news_id,
            req.user,
        );
        return { message: 'News restored successfully', data: true };
    }

}









