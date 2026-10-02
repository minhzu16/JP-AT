import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { SkillsModule } from './modules/skills/skills.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { SavedJobsModule } from './modules/saved-jobs/saved-jobs.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    SkillsModule,
    CandidatesModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule,
    SavedJobsModule,
    DocumentsModule,
    InterviewsModule,
    MatchingModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
