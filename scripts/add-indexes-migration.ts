import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/auth/database/providers/schema/user.schema';

async function addIndexesToExistingRecords() {
    console.log('🚀 Iniciando migração de índices para Users...\n');

    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        // Get user model
        const userModel = app.get<Model<User>>(getModelToken(User.name));

        // Migrate Users
        console.log('📝 Processando Users...');
        const usersWithoutIndex = await userModel
            .find({ index: { $exists: false } })
            .sort({ createdAt: 1 })
            .lean();

        console.log(`   Encontrados ${usersWithoutIndex.length} users sem index`);

        if (usersWithoutIndex.length > 0) {
            const maxUserIndex = await userModel
                .findOne({ index: { $exists: true } }, { index: 1 })
                .sort({ index: -1 })
                .lean();

            let currentIndex = maxUserIndex?.index || 0;

            for (const user of usersWithoutIndex) {
                currentIndex++;
                await userModel.updateOne(
                    { _id: user._id },
                    { $set: { index: currentIndex } },
                );
            }

            console.log(`   ✅ ${usersWithoutIndex.length} users atualizados (índices ${maxUserIndex?.index || 0 + 1}-${currentIndex})`);
        } else {
            console.log('   ✅ Todos os users já possuem index');
        }

        console.log('\n✨ Migração concluída com sucesso!\n');
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

addIndexesToExistingRecords();
