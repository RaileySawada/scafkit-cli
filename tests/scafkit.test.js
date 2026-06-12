const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { startCli, handleCommand } = require("../src");
const { _internals: laravelBuild } = require("../src/commands/laravelBuild");

assert.equal(typeof startCli, "function");
assert.equal(typeof handleCommand, "function");

const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "scafkit-laravel-"));
const migrationsDir = path.join(fixtureDir, "database", "migrations");
const seedersDir = path.join(fixtureDir, "database", "seeders");

fs.mkdirSync(migrationsDir, { recursive: true });
fs.mkdirSync(seedersDir, { recursive: true });
fs.writeFileSync(
  path.join(migrationsDir, "2026_06_12_000000_create_cache_table.php"),
  `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
        });
    }
};
`,
);
fs.writeFileSync(
  path.join(migrationsDir, "2026_06_12_000001_create_sessions_table.php"),
  `<?php

Schema::create(config('session.table', 'sessions'), function ($table) {
    $table->string('id')->primary();
});
`,
);
fs.writeFileSync(path.join(seedersDir, "DatabaseSeeder.php"), "<?php\n");

assert.equal(laravelBuild.migrationMentionsTable(fixtureDir, "cache"), true);
assert.equal(laravelBuild.migrationMentionsTable(fixtureDir, "cache_locks"), true);
assert.equal(laravelBuild.migrationMentionsTable(fixtureDir, "sessions"), true);
assert.equal(laravelBuild.migrationMentionsTable(fixtureDir, "jobs"), false);
assert.equal(laravelBuild.hasDatabaseSeeders(fixtureDir), true);

const cacheLocksOnlyDir = fs.mkdtempSync(path.join(os.tmpdir(), "scafkit-cache-locks-"));
const cacheLocksOnlyMigrations = path.join(cacheLocksOnlyDir, "database", "migrations");

fs.mkdirSync(cacheLocksOnlyMigrations, { recursive: true });
fs.writeFileSync(
  path.join(cacheLocksOnlyMigrations, "2026_06_12_000002_create_cache_locks_table.php"),
  "<?php\n",
);

assert.equal(laravelBuild.migrationMentionsTable(cacheLocksOnlyDir, "cache"), false);
assert.equal(laravelBuild.migrationMentionsTable(cacheLocksOnlyDir, "cache_locks"), true);

const generatedMigration = laravelBuild.writeTableMigration(cacheLocksOnlyDir, "sessions");
assert.equal(path.basename(generatedMigration).includes("_scafkit_create_sessions_table.php"), true);
assert.equal(fs.existsSync(generatedMigration), true);

const sqlDumpPath = path.join(cacheLocksOnlyDir, "database.sql");
fs.writeFileSync(
  sqlDumpPath,
  [
    "CREATE TABLE users (id bigint unsigned not null);",
    "SET @@SESSION.SQL_LOG_BIN= 0;",
    "SET @@GLOBAL.GTID_PURGED='aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:1-9';",
    "INSERT INTO users VALUES (1);",
  ].join("\n"),
);

laravelBuild.sanitizeSqlDumpForSharedHosting(sqlDumpPath);

const sanitizedSql = fs.readFileSync(sqlDumpPath, "utf8");
assert.equal(sanitizedSql.includes("SQL_LOG_BIN"), false);
assert.equal(sanitizedSql.includes("GTID_PURGED"), false);
assert.equal(sanitizedSql.includes("CREATE TABLE users"), true);
assert.equal(sanitizedSql.includes("INSERT INTO users"), true);
