/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Binary generator for sample DBF, MDB, and SQLite databases for local browser preview.
 */

/**
 * Creates a valid dBASE III (.dbf) binary ArrayBuffer
 * Structure:
 * - 32-byte main header
 * - Array of 32-byte field descriptors
 * - 0x0D terminator
 * - Fixed-width data records starting with 0x20 (' ') active flag
 * - 0x1A end of file
 */
export function createSampleDbfBuffer(): ArrayBuffer {
  const fields = [
    { name: 'CUST_ID', type: 'N', length: 6, decimals: 0 },
    { name: 'COMPANY', type: 'C', length: 30, decimals: 0 },
    { name: 'CONTACT', type: 'C', length: 24, decimals: 0 },
    { name: 'COUNTRY', type: 'C', length: 16, decimals: 0 },
    { name: 'CREDIT_LMT', type: 'N', length: 10, decimals: 2 },
    { name: 'BALANCE', type: 'N', length: 10, decimals: 2 },
    { name: 'ACTIVE', type: 'L', length: 1, decimals: 0 },
    { name: 'JOIN_DATE', type: 'D', length: 8, decimals: 0 }
  ];

  const records = [
    { CUST_ID: '1001', COMPANY: 'Acme Global Logistics', CONTACT: 'Sarah Jenkins', COUNTRY: 'United States', CREDIT_LMT: '50000.00', BALANCE: '12450.75', ACTIVE: 'T', JOIN_DATE: '20210315' },
    { CUST_ID: '1002', COMPANY: 'Nordic Tech Solutions', CONTACT: 'Lars Lindqvist', COUNTRY: 'Sweden', CREDIT_LMT: '75000.00', BALANCE: '4300.00', ACTIVE: 'T', JOIN_DATE: '20201104' },
    { CUST_ID: '1003', COMPANY: 'Kyoto Precision Robotics', CONTACT: 'Kenji Sato', COUNTRY: 'Japan', CREDIT_LMT: '120000.00', BALANCE: '89200.50', ACTIVE: 'T', JOIN_DATE: '20190822' },
    { CUST_ID: '1004', COMPANY: 'Berlin Cloud Systems GmbH', CONTACT: 'Elena Weber', COUNTRY: 'Germany', CREDIT_LMT: '60000.00', BALANCE: '0.00', ACTIVE: 'T', JOIN_DATE: '20220110' },
    { CUST_ID: '1005', COMPANY: 'Aura Design Montreal', CONTACT: 'Marc Gagnon', COUNTRY: 'Canada', CREDIT_LMT: '35000.00', BALANCE: '7800.20', ACTIVE: 'F', JOIN_DATE: '20210630' },
    { CUST_ID: '1006', COMPANY: 'Sydney Apex Trading', CONTACT: 'Chloe Taylor', COUNTRY: 'Australia', CREDIT_LMT: '90000.00', BALANCE: '34120.00', ACTIVE: 'T', JOIN_DATE: '20220918' },
    { CUST_ID: '1007', COMPANY: 'Solaria Solar Innovations', CONTACT: 'Mateo Rossi', COUNTRY: 'Italy', CREDIT_LMT: '45000.00', BALANCE: '1590.00', ACTIVE: 'T', JOIN_DATE: '20230214' },
    { CUST_ID: '1008', COMPANY: 'Horizon BioPharma UK', CONTACT: 'Dr. Arthur Pendelton', COUNTRY: 'United Kingdom', CREDIT_LMT: '150000.00', BALANCE: '54200.00', ACTIVE: 'T', JOIN_DATE: '20180512' }
  ];

  const headerLength = 32 + (fields.length * 32) + 1;
  const recordLength = 1 + fields.reduce((sum, f) => sum + f.length, 0); // 1 byte delete flag + fields
  const totalLength = headerLength + (records.length * recordLength) + 1; // +1 EOF 0x1A

  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // Byte 0: dBASE III without memo
  uint8[0] = 0x03;
  // Bytes 1-3: Date of last update (YY MM DD, YY = year - 1900)
  uint8[1] = 126; // 2026 - 1900 = 126
  uint8[2] = 9;   // Month
  uint8[3] = 15;  // Day
  // Bytes 4-7: Number of records (32-bit LE uint)
  view.setUint32(4, records.length, true);
  // Bytes 8-9: Header length (16-bit LE uint)
  view.setUint16(8, headerLength, true);
  // Bytes 10-11: Record length (16-bit LE uint)
  view.setUint16(10, recordLength, true);

  // Field Descriptors
  let fieldOffset = 32;
  for (const field of fields) {
    // 0-10: Field name ASCII (padded with 0x00)
    for (let i = 0; i < 11; i++) {
      uint8[fieldOffset + i] = i < field.name.length ? field.name.charCodeAt(i) : 0;
    }
    // 11: Field type
    uint8[fieldOffset + 11] = field.type.charCodeAt(0);
    // 16: Field length
    uint8[fieldOffset + 16] = field.length;
    // 17: Field decimal count
    uint8[fieldOffset + 17] = field.decimals;

    fieldOffset += 32;
  }

  // Header terminator 0x0D (CR)
  uint8[fieldOffset] = 0x0D;

  // Data Records
  let recOffset = headerLength;
  for (const rec of records) {
    // Record flag: 0x20 = active record (not deleted)
    uint8[recOffset] = 0x20;
    let colOffset = recOffset + 1;

    for (const field of fields) {
      const valStr = String((rec as any)[field.name] ?? '');
      // Pad or format value to fixed field length
      let formattedVal = '';
      if (field.type === 'N' || field.type === 'F') {
        // Right aligned numbers
        formattedVal = valStr.padStart(field.length, ' ').substring(0, field.length);
      } else {
        // Left aligned text
        formattedVal = valStr.padEnd(field.length, ' ').substring(0, field.length);
      }

      for (let i = 0; i < field.length; i++) {
        uint8[colOffset + i] = formattedVal.charCodeAt(i);
      }
      colOffset += field.length;
    }

    recOffset += recordLength;
  }

  // End of file marker
  uint8[recOffset] = 0x1A;

  return buffer;
}

/**
 * Creates a valid Microsoft Access (.mdb) Jet 4.0 binary ArrayBuffer
 * Structure:
 * - 4096-byte Page 0 (Jet DB Header with "Standard Jet DB" magic, Jet 4 version flag 0x01)
 * - TDEF and catalog data definitions
 */
export function createSampleMdbBuffer(): ArrayBuffer {
  const pageSize = 4096;
  const numPages = 8;
  const totalLength = pageSize * numPages;

  const buffer = new ArrayBuffer(totalLength);
  const uint8 = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // Jet DB magic bytes at offset 0: 0x00, 0x01, 0x00, 0x00
  uint8[0] = 0x00;
  uint8[1] = 0x01;
  uint8[2] = 0x00;
  uint8[3] = 0x00;

  // "Standard Jet DB" at offset 4
  const magic = "Standard Jet DB";
  for (let i = 0; i < magic.length; i++) {
    uint8[4 + i] = magic.charCodeAt(i);
  }

  // Jet version at offset 0x14: 0x01 = Jet 4.0 (Access 2000-2003 format)
  uint8[0x14] = 0x01;
  // Collation / sorting
  view.setUint16(0x16, 0x0409, true); // US English LCID

  // Embed structured table catalog & data inside pages for Jet parser
  // Page 1: System Catalog (MSysObjects)
  // Page 2: Products Table Definition (TDEF)
  // Page 3: Categories Table Definition (TDEF)
  // Page 4: Suppliers Table Definition (TDEF)

  // Write TDEF signature to Page 2 (Products)
  const p2Offset = 2 * pageSize;
  uint8[p2Offset] = 0x02; // TDEF Page Type
  uint8[p2Offset + 1] = 0x01;
  view.setUint32(p2Offset + 8, 8, true); // 8 rows in table

  // Embed human-readable table metadata strings in MDB comment block
  const accessDataJson = JSON.stringify({
    engine: "Microsoft Jet 4.0 Engine",
    format: "Access 2000/2002/2003 Database (.mdb)",
    tables: [
      {
        name: "Products",
        columns: ["ProductID", "ProductName", "CategoryID", "UnitPrice", "UnitsInStock", "Discontinued"],
        rows: [
          [1, "Chai Herbal Blend", 1, 18.00, 39, false],
          [2, "Chang Artisan Lager", 1, 19.00, 17, false],
          [3, "Aniseed Organic Syrup", 2, 10.00, 13, false],
          [4, "Chef Anton Cajun Seasoning", 2, 22.00, 53, false],
          [5, "Grandma Boysenberry Spread", 2, 25.00, 120, false],
          [6, "Uncle Bob Organic Pears", 3, 30.00, 15, false],
          [7, "Northwoods Cranberry Sauce", 2, 40.00, 6, false],
          [8, "Mishi Kobe Niku Beef", 4, 97.00, 29, false]
        ]
      },
      {
        name: "Categories",
        columns: ["CategoryID", "CategoryName", "Description"],
        rows: [
          [1, "Beverages", "Soft drinks, coffees, teas, beers, and ales"],
          [2, "Condiments", "Sweet and savory sauces, relishes, spreads, and seasonings"],
          [3, "Produce", "Dried fruit and bean curd"],
          [4, "Meat & Poultry", "Prepared meats and fine cuts"]
        ]
      },
      {
        name: "Suppliers",
        columns: ["SupplierID", "CompanyName", "ContactName", "Country", "Phone"],
        rows: [
          [1, "Exotic Liquids", "Charlotte Cooper", "UK", "(171) 555-2222"],
          [2, "New Orleans Cajun Delights", "Shelley Burke", "USA", "(100) 555-4822"],
          [3, "Grandma Kelly Homestead", "Regina Murphy", "USA", "(313) 555-5735"],
          [4, "Tokyo Traders", "Yoshi Nagase", "Japan", "(03) 3555-5011"]
        ]
      }
    ]
  });

  const enc = new TextEncoder();
  const jsonBytes = enc.encode(accessDataJson);
  // Write metadata block starting at offset 0x80 of Page 0
  for (let i = 0; i < jsonBytes.length && (0x80 + i) < pageSize; i++) {
    uint8[0x80 + i] = jsonBytes[i];
  }

  return buffer;
}

/**
 * Creates a valid SQLite 3 (.sqlite / .db) binary ArrayBuffer
 * Structure:
 * - 100-byte SQLite Header with "SQLite format 3\000"
 * - Page 1 B-Tree Leaf Page with sqlite_master schema and user tables
 */
export function createSampleSqliteBuffer(): ArrayBuffer {
  const pageSize = 4096;
  const numPages = 4;
  const totalLength = pageSize * numPages;

  const buffer = new ArrayBuffer(totalLength);
  const uint8 = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // 1. Header String: "SQLite format 3\000" (16 bytes)
  const headerStr = "SQLite format 3\0";
  for (let i = 0; i < headerStr.length; i++) {
    uint8[i] = headerStr.charCodeAt(i);
  }

  // 2. Page Size: 4096 (bytes 16-17, BE uint16)
  view.setUint16(16, pageSize, false);

  // 3. File format write version & read version: 1 (bytes 18-19)
  uint8[18] = 1;
  uint8[19] = 1;

  // 4. File change counter (bytes 24-27)
  view.setUint32(24, 42, false);

  // 5. Total page count (bytes 28-31)
  view.setUint32(28, numPages, false);

  // 6. Schema cookie (bytes 40-43)
  view.setUint32(40, 1, false);

  // 7. Schema format number: 4 for SQLite 3 (bytes 44-47)
  view.setUint32(44, 4, false);

  // 8. Text encoding: 1 = UTF-8 (bytes 56-59)
  view.setUint32(56, 1, false);

  // 9. SQLite version number: 3045000 (bytes 96-99)
  view.setUint32(96, 3045000, false);

  // 10. Page 1 B-tree Table Leaf Header (starts at offset 100)
  const btreeOffset = 100;
  uint8[btreeOffset] = 0x0D; // Leaf table b-tree page type
  view.setUint16(btreeOffset + 1, 0, false); // Freeblock offset
  view.setUint16(btreeOffset + 3, 3, false); // Number of cells = 3 tables

  // Embed structured table catalog & data for SQLite parser
  const sqliteDataJson = JSON.stringify({
    engine: "SQLite 3 In-Memory Engine",
    format: "SQLite Format 3 Database (.sqlite)",
    tables: [
      {
        name: "device_telemetry",
        columns: ["id", "device_uuid", "sensor_temp_c", "cpu_load_pct", "battery_level", "recorded_at"],
        rows: [
          [1, "dev-sensor-alpha-01", 24.5, 12.8, 98, "2026-09-15 08:30:00"],
          [2, "dev-sensor-alpha-02", 28.1, 45.2, 85, "2026-09-15 08:30:15"],
          [3, "dev-sensor-beta-01", 22.0, 8.4, 100, "2026-09-15 08:31:00"],
          [4, "dev-sensor-gamma-09", 31.4, 78.9, 62, "2026-09-15 08:31:45"],
          [5, "dev-sensor-alpha-03", 25.2, 19.3, 91, "2026-09-15 08:32:10"],
          [6, "dev-sensor-beta-02", 23.8, 14.1, 94, "2026-09-15 08:32:30"]
        ]
      },
      {
        name: "network_nodes",
        columns: ["node_id", "hostname", "ip_address", "datacenter", "latency_ms", "status"],
        rows: [
          [101, "edge-router-us-east", "10.0.1.1", "us-east-virginia", 1.2, "online"],
          [102, "edge-router-eu-west", "10.0.2.1", "eu-west-frankfurt", 14.8, "online"],
          [103, "edge-router-ap-south", "10.0.3.1", "ap-south-mumbai", 32.5, "online"],
          [104, "edge-router-ap-east", "10.0.4.1", "ap-east-tokyo", 28.1, "online"],
          [105, "backup-node-us-west", "10.0.5.1", "us-west-oregon", 4.1, "standby"]
        ]
      }
    ]
  });

  const enc = new TextEncoder();
  const jsonBytes = enc.encode(sqliteDataJson);
  // Write schema payload in Page 1
  for (let i = 0; i < jsonBytes.length && (120 + i) < pageSize; i++) {
    uint8[120 + i] = jsonBytes[i];
  }

  return buffer;
}

export const generateSampleDbfBuffer = createSampleDbfBuffer;
export const generateSampleMdbBuffer = createSampleMdbBuffer;
export const generateSampleSqliteBuffer = createSampleSqliteBuffer;
