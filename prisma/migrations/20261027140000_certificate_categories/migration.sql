-- CreateTable
CREATE TABLE "certificate_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_categories_name_key" ON "certificate_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_categories_slug_key" ON "certificate_categories"("slug");

-- CreateIndex
CREATE INDEX "certificate_categories_sort_order_idx" ON "certificate_categories"("sort_order");
