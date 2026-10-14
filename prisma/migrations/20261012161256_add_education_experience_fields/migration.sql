-- AlterTable
ALTER TABLE "education" ADD COLUMN     "expected_grad_year" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Completed',
ADD COLUMN     "university" TEXT;

-- AlterTable
ALTER TABLE "experiences" ADD COLUMN     "employment_type" TEXT DEFAULT 'Full-time',
ADD COLUMN     "workplace_type" TEXT DEFAULT 'On-site';
