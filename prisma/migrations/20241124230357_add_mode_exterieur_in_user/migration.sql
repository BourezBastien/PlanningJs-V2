-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "societeId" INTEGER,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "verifiedEmail" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT,
    "dateValidToken" DATETIME,
    "password" TEXT,
    "temp_password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '1',
    "color" TEXT NOT NULL,
    "exterieur" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("color", "createdAt", "dateValidToken", "email", "id", "password", "role", "societeId", "temp_password", "token", "updatedAt", "username", "verifiedEmail") SELECT "color", "createdAt", "dateValidToken", "email", "id", "password", "role", "societeId", "temp_password", "token", "updatedAt", "username", "verifiedEmail" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
