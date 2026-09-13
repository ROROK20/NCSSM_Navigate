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
 * With ?sheet=<name> and the token, it returns one readable tab as JSON, so
 * the site can read entries an officer typed into a spreadsheet instead of
 * losing them on the next deploy.
 *
 * READABLE is an allow-list, and the Submissions tab is deliberately not in
 * it. That tab is write-only by construction rather than by convention: there
 * is no value of ?sheet= that reaches it, so a leaked token cannot read one
 * student's report. Adding a tab here makes it world-readable to anyone
 * holding the token, so add only tabs meant to be public.
 *
 * TAB: "Updates" - the issue status board.
 *   id | title | category | status | dateUpdated | summary | nextStep
 *
 *   category: academics, residential-life, dining, transportation,
 *   technology, student-life, accessibility, other
 *   status: received, under-review, referred, in-progress, awaiting-response,
 *   resolved, unable-to-pursue
 *
 * TAB: "Feed" - what Student Government itself is doing. Separate from the
 * board above: that one follows a student's problem, this one follows SG.
 *   id | kind | date | title | body | stage | example
 *
 *   kind: meeting, proposal, response
 *   stage (proposals only, otherwise leave empty): drafted, before-senate,
 *   passed-senate, with-administration, adopted, not-pursued
 *   example: leave empty. "yes" marks a row as an illustration rather than
 *   something that happened, and the site labels it as one.
 *
 * The moment the Feed tab has a single row, the site stops showing its own
 * built-in examples entirely.
 */
var READABLE = { updates: "Updates", feed: "Feed" };

function doGet(e) {
  var wants = (e && e.parameter && e.parameter.sheet) || "";
  var tab = Object.prototype.hasOwnProperty.call(READABLE, wants)
    ? READABLE[wants]
    : null;
  if (!tab) {
    return reply(200, { ok: true, service: "ncssm-navigate-store" });
  }

  var token = (e.parameter && e.parameter.token) || "";
  if (SHARED_TOKEN && token !== SHARED_TOKEN) {
    return reply(401, { ok: false, error: "unauthorized" });
  }

  var body = { ok: true };
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tab);
  if (!sheet || sheet.getLastRow() < 2) {
    body[wants] = [];
    return reply(200, body);
  }

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

  body[wants] = rows;
  return reply(200, body);
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
