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
import { DealDto } from './dto/deal.dto';
import { DealsService } from './deals.service';

@Controller({
    path: 'deal',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Deal')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class DealsController {
    constructor(private readonly dealservice: DealsService) { }

    // Add Deal
    @Post('/addDeal')
    @ApiOperation({ summary: 'Add Deal' })
    @ApiOkResponse({
        description: 'Deal added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addDeal(@Body() dealDto: DealDto, @Request() req) {
        const deal = await this.dealservice.addDeal(
            dealDto,
            req.user,
        );
        if (deal.status == true) {
            return { status: true, message: 'Deal added successfully' };
        } else {
            throw new NotImplementedException(deal.status);
        }
    }

    // Update Deal
    @Put('/editDeal/:deal_id')
    @ApiOperation({ summary: 'Update Deal' })
    @ApiOkResponse({
        description: 'Deal updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateDeal(
        @Request() req,
        @Param('deal_id') deal_id: string,
        @Body() dealDto: DealDto,
    ) {
        await this.dealservice.updateDeal(
            deal_id,
            dealDto,
            req.user,
        );
        return { status: true, message: 'Deal updated successfully', data: true };
    }

    // GET All Deal list
    @Get('/getDealsList')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get All Deals' })
    @ApiOkResponse({
        description: 'Deals fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getDealsList(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const dealslist = await this.dealservice.getDealsList(
            req.user,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Deals fetched successfully', data: dealslist };
    }

    // GET All Deals by Date
    @Get('/getDealsByDate/:date')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Deals by Date' })
    @ApiOkResponse({
        description: 'Deals fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getDealsByDate(
        @Request() req,
        @Param('date') date: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const deals = await this.dealservice.getDealsByDate(
            req.user,
            date,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Deals fetched successfully', data: deals };
    }

    // GET Deal by Id
    @Get('/getDealById/:deal_id')
    @ApiOperation({ summary: 'Get Deal By Id' })
    @ApiOkResponse({
        description: 'Deal fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getDealById(
        @Request() req,
        @Param('deal_id') deal_id: string,
    ) {
        const deal = await this.dealservice.getDealById(
            deal_id,
            req.user,
        );
        return { status: true, message: 'Deal fetched successfully', data: deal };
    }

    // Delete Deal
    @Delete('/deleteDeal/:deal_id')
    @ApiOperation({ summary: 'Delete Deal' })
    @ApiOkResponse({
        description: 'Deal deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteDeal(
        @Request() req,
        @Param('deal_id') deal_id: string
    ) {
        await this.dealservice.deleteDeal(
            deal_id,
            req.user,
        );
        return { message: 'Deal deleted successfully', data: true };
    }

    // Restore Deal
    @Delete('/restoreDeal/:deal_id')
    @ApiOperation({ summary: 'Restore Deal' })
    @ApiOkResponse({
        description: 'Deal restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreDeal(
        @Request() req,
        @Param('deal_id') deal_id: string,
    ) {
        await this.dealservice.restoreDeal(
            deal_id,
            req.user,
        );
        return { message: 'Deal restored successfully', data: true };
    }

}









