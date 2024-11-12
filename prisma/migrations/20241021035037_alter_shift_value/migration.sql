-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_shift_id_fkey`;

-- AlterTable
ALTER TABLE `User` MODIFY `shift_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `Shift`(`shift_id`) ON DELETE SET NULL ON UPDATE CASCADE;
