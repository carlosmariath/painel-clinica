import { Controller } from '@nestjs/common';
import { TherapyPlansService } from '../services/therapy-plans.service';
import { TherapyPlanService } from '../services/therapy-plan.service';

@Controller('therapy-plans')
export class TherapyPlansController {
  constructor(
    private readonly therapyPlanService: TherapyPlanService,
    private readonly therapyPlansService: TherapyPlansService
  ) {}
} 