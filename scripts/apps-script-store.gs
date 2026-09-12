/**
 * NCSSM Navigate — submission sink for Google Apps Script.
 *
 * Turns a private Google Sheet into the system of record for issue
 * submissions. Costs nothing, lives in Workspace that SG already has, and
 * gives officers a spreadsheet rather than a new tool to learn.
 *
 * SETUP
 *  1. Create a Google Sheet. Name the first tab "Submissions".
 *     Keep it private. Share it with SG officers only.
 *  2. Extensions -> Apps Script. Paste this file over Code.gs.
 *  3. Set SHARED_TOKEN below to a long random string.
 *  4. Deploy -> New deployment -> Web app.
 *       Execute as:        Me
 *       Who has access:    Anyone
 *     "Anyone" is required for the site to POST to it. The token below is what
 *     actually guards it, which is why it must not be guessable.
 *  5. Apps Script cannot read custom request headers, so the token travels in
 *     the query string. Set the site's ISSUE_STORE_URL to the Web app URL with
 *     the token appended:
 *         https://script.google.com/macros/s/AKfy.../exec?token=YOUR-TOKEN
 *     (ISSUE_STORE_TOKEN is only for sinks that can read headers; leave it
 *     unset for Apps Script.)
 *  6. Submit a test issue and confirm a row appears. Then delete the row.
 *
 * PRIVACY
 * Rows can contain a student's email when they chose not to be anonymous.
 * Treat this Sheet as confidential: restrict sharing, never publish it, never
 * copy rows into anything public, and delete rows once the issue is actioned.
 */

var SHARED_TOKEN = "CHANGE-ME-to-a-long-random-string";
var SHEET_NAME = "Submissions";

var HEADERS = [
  "Received (UTC)",
  "ID",
  "Category",
  "Title",
  "Description",
  "Location",
  "Anonymous",
  "Contact",
  "Triage",
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply(400, { ok: false, error: "empty_body" });
    }

    // Apps Script cannot read custom request headers, so the token is checked
    // from the query string. Deploy the URL with ?token=... appended.
    var token = (e.parameter && e.parameter.token) || "";
    if (SHARED_TOKEN && token !== SHARED_TOKEN) {
      return reply(401, { ok: false, error: "unauthorized" });
    }

    var record = JSON.parse(e.postData.contents);
    var sheet = getSheet();

    sheet.appendRow([
      record.createdAt || new Date().toISOString(),
      record.id || "",
      record.category || "",
      record.title || "",
      record.description || "",
      record.location || "",
      record.anonymous ? "yes" : "no",
      record.contact || "",
      record.triage || "new",
    ]);

    return reply(200, { ok: true });
  } catch (err) {
    // Never echo the submission back in an error.
    return reply(500, { ok: false, error: "server_error" });
  }
}

/**
 * GET serves two purposes.
 *
 * With no parameters it is a health check.
 *
 * With ?sheet=updates and the token, it returns the public status board as
 * JSON, so the site can read entries an officer typed into a spreadsheet
 * instead of losing them on the next deploy. Only the Updates tab is ever
 * readable this way. The Submissions tab is write-only, by omission: there is
 * no code path here that returns it.
 *
 * Add a second tab named "Updates" with these headers, in this order:
 *   id | title | category | status | dateUpdated | summary | nextStep
 *
 * category must be one of: academics, residential-life, dining,
 * transportation, technology, student-life, accessibility, other
 * status must be one of: received, under-review, referred, in-progress,
 * awaiting-response, resolved, unable-to-pursue
 */
var UPDATES_SHEET = "Updates";

function doGet(e) {
  var wants = e && e.parameter && e.parameter.sheet;
  if (wants !== "updates") {
    return reply(200, { ok: true, service: "ncssm-navigate-store" });
  }

  var token = (e.parameter && e.parameter.token) || "";
  if (SHARED_TOKEN && token !== SHARED_TOKEN) {
    return reply(401, { ok: false, error: "unauthorized" });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(UPDATES_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return reply(200, { ok: true, updates: [] });

  var values = sheet.getDataRange().getValues();
  var head = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var c = 0; c < head.length; c++) {
      var v = values[i][c];
      // Dates come back as Date objects; the site wants plain ISO days.
      row[head[c]] = Object.prototype.toString.call(v) === "[object Date]"
        ? Utilities.formatDate(v, "UTC", "yyyy-MM-dd")
        : String(v).trim();
    }
    if (row.id && row.title) rows.push(row);
  }

  return reply(200, { ok: true, updates: rows });
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function reply(status, body) {
  // Apps Script web apps always answer 200; the status rides in the body.
  body.status = status;
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
