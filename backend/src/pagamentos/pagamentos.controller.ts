import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PagamentosService } from './pagamentos.service';
import { UploadComprovanteDto, AprovarPagamentoDto, RejeitarPagamentoDto, InitiatePaymentDto } from './dto/payment-action.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PagamentosService) { }

  @Post('initiate')
  @Roles('aluno', 'admin', 'diretor', 'secretaria')
  @ApiOperation({ summary: 'Initiate payment process' })
  initiate(@Body() dto: InitiatePaymentDto) {
    return this.service.initiatePayment(dto);
  }

  @Post(':id/upload-proof')
  @Roles('aluno', 'admin', 'diretor', 'secretaria')
  @ApiOperation({ summary: 'Upload payment proof' })
  uploadProof(
    @Param('id') id: string,
    @Body() dto: UploadComprovanteDto
  ) {
    return this.service.uploadPaymentProof(id, dto);
  }

  @Post(':id/approve')
  @Roles('admin', 'diretor')
  @ApiOperation({ summary: 'Approve payment (Admin/Director)' })
  approve(
    @Param('id') id: string,
    @Body() dto: AprovarPagamentoDto
  ) {
    return this.service.approvePayment(id, dto);
  }

  @Post(':id/reject')
  @Roles('admin', 'diretor')
  @ApiOperation({ summary: 'Reject payment (Admin/Director)' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejeitarPagamentoDto
  ) {
    return this.service.rejectPayment(id, dto);
  }

  @Get('pending')
  @Roles('admin', 'diretor', 'secretaria')
  @ApiOperation({ summary: 'List pending payments' })
  listPending() {
    return this.service.listarPendentes();
  }
}
