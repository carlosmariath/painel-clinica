import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TherapyPlansService } from './services/therapy-plans.service';
import { TherapyPlanService } from './services/therapy-plan.service';
import { CreateTherapyPlanDto } from './dto/create-plan.dto';
import { UpdateTherapyPlanDto } from './dto/update-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { TherapyPlanDto } from './dto/therapy-plan.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiQuery, 
  ApiResponse, 
  ApiOkResponse, 
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Controlador para os planos de terapia
@ApiTags('Planos de Terapia')
@Controller('therapy-plans')
@UseGuards(JwtAuthGuard)
export class TherapyPlansController {
  constructor(
    private readonly therapyPlanService: TherapyPlanService,
    private readonly therapyPlansService: TherapyPlansService
  ) {}
} 