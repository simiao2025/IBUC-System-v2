import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
import { WorkersService } from './workers.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workers')
export class WorkersController {
    constructor(private readonly service: WorkersService) { }

    @Get('job/:id')
    async getJobStatus(@Param('id') id: string) {
        return this.service.getJobStatus(id);
    }
}
