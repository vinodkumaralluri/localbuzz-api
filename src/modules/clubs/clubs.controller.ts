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
import { ClubDto } from './dto/club.dto';
import { ClubsService } from './clubs.service';
import { ClubTypes } from 'src/enums/club-types.enum';

@Controller({
    path: 'clubs',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Clubs')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ClubsController {
    constructor(private readonly clubservice: ClubsService) { }

    // Add Club
    @Post('/addClub')
    @ApiOperation({ summary: 'Add Club' })
    @ApiOkResponse({
        description: 'Club added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addClub(@Body() clubDto: ClubDto, @Request() req) {
        const club = await this.clubservice.addClub(
            clubDto,
            req.user,
        );
        if (club.status == true) {
            return { status: true, message: 'Club added successfully' };
        } else {
            throw new NotImplementedException(club.status);
        }
    }

    // Update Club
    @Put('/editClub/:club_id')
    @ApiOperation({ summary: 'Update Club' })
    @ApiOkResponse({
        description: 'Club updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateClub(
        @Request() req,
        @Param('club_id') club_id: string,
        @Body() clubDto: ClubDto,
    ) {
        await this.clubservice.updateClub(
            club_id,
            clubDto,
            req.user,
        );
        return { status: true, message: 'Club updated successfully', data: true };
    }

    // GET All Clubs list
    @Get('/getClubsList')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get All Clubs' })
    @ApiOkResponse({
        description: 'Clubs fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getClubsList(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const clubslist = await this.clubservice.getClubsList(
            req.user,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Clubs fetched successfully', data: clubslist };
    }

    // GET All Clubs by Type
    @Get('/getClubsByType/:type')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Clubs by Date' })
    @ApiOkResponse({
        description: 'Clubs fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getClubsByType(
        @Request() req,
        @Param('type') type: ClubTypes,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const clubs = await this.clubservice.getClubsByType(
            req.user,
            type,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Clubs fetched successfully', data: clubs };
    }

    // GET Club by Id
    @Get('/getClubById/:club_id')
    @ApiOperation({ summary: 'Get Club By Id' })
    @ApiOkResponse({
        description: 'Club fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getClubById(
        @Request() req,
        @Param('club_id') club_id: string,
    ) {
        const club = await this.clubservice.getClubById(
            club_id,
            req.user,
        );
        return { status: true, message: 'Club fetched successfully', data: club };
    }

    // Delete Club
    @Delete('/deleteClub/:club_id')
    @ApiOperation({ summary: 'Delete Club' })
    @ApiOkResponse({
        description: 'Club deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteClub(
        @Request() req,
        @Param('club_id') club_id: string
    ) {
        await this.clubservice.deleteClub(
            club_id,
            req.user,
        );
        return { message: 'Club deleted successfully', data: true };
    }

    // Restore Club
    @Delete('/restoreClub/:club_id')
    @ApiOperation({ summary: 'Restore Club' })
    @ApiOkResponse({
        description: 'Club restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreClub(
        @Request() req,
        @Param('club_id') club_id: string,
    ) {
        await this.clubservice.restoreClub(
            club_id,
            req.user,
        );
        return { message: 'Club restored successfully', data: true };
    }

}









