-- AlterTable
ALTER TABLE `Attendance` MODIFY `check_in_time` VARCHAR(191) NOT NULL,
    MODIFY `check_out_time` VARCHAR(191) NULL,
    MODIFY `date_marked` VARCHAR(191) NOT NULL;
