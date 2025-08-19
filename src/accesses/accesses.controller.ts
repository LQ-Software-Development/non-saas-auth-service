import { Body, Controller, Get, Headers, Param, Put, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetAccessesService } from "./services/get-accesses.service";
import { GetAccessService } from "./services/get-access.service";


@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('User Accesses')
@Controller('accesses')
export class ProfilesController {
    constructor(
        private readonly getAccessesService: GetAccessesService,
        private readonly getAccessService: GetAccessService,
    ) { }

    @Get()
    async getAccesses(@Req() request: any) {
        const userId = request.user?.sub;

        return this.getAccessesService.execute(userId);
    }

    @Get(':organizationId')
    async getAccess(@Req() request: any, @Param('organizationId') organizationId: string) {
        const userId = request.user?.sub;

        return this.getAccessService.execute(userId, organizationId);
    }
}
