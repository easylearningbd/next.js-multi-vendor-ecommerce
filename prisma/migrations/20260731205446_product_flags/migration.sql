-- AlterTable
ALTER TABLE `product` ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPopular` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Product_isFeatured_idx` ON `Product`(`isFeatured`);

-- CreateIndex
CREATE INDEX `Product_isPopular_idx` ON `Product`(`isPopular`);
