import { Body, Controller, Get, Headers, Put, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GetProfileService } from "./services/get-profile.service";
import { PutProfileService } from "./services/put-profile.service";
import { PutProfileDto } from "./dto/put-profile.dto";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Profiles')
@ApiHeader({
    name: 'x-organization-id',
    description: 'The ID of the organization',
    required: false
})
@Controller('profiles')
export class ProfilesController {
    constructor(
        private readonly getProfileService: GetProfileService,
        private readonly putProfileService: PutProfileService
    ) { }

    @Get()
    async getProfile(@Req() request: any) {
        const userId = request.user?.id;
        const organizationId = request.headers['x-organization-id'];

        return this.getProfileService.execute(userId, organizationId);
    }

    @Put()
    async putProfile(@Req() request: any, @Body() dto: PutProfileDto) {
        const userId = request.user?.id;
        const organizationId = request.headers['x-organization-id'];

        return this.putProfileService.execute({ userId, organizationId, ...dto });
    }
}
