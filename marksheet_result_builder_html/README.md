# WISE Marksheet HTML/CSS Template — AGY Handoff

## What this package contains

- `marksheet.hbs` — Handlebars-compatible dynamic template.
- `marksheet.css` — print-oriented CSS with percentage-based positioning.
- `preview.html` — browser preview using the supplied sample data.
- `assets/marksheet-background.png` — supplied BLANK marksheet artwork, used as the current reference/background.
- `sample-data.json` — example payload.

## Important

This is the **first implementation scaffold**, not the final pixel-perfect production template.

The blank artwork supplied by the user aligns closely with the populated example. The current approach intentionally uses that blank artwork as the background so that AGY can immediately wire the Result Generation Engine and PDF renderer.

The next production step should be to replace the raster background with a vector/SVG reconstruction where practical:
- security wave pattern
- borders
- corner ornaments
- fixed decorative elements
- fixed logos/seals where vector originals are available

Do NOT convert the student photograph to SVG. Keep it as an image.
Generate the QR code dynamically from the public verification URL.

## Handlebars helpers

`marksheet.hbs` currently expects a helper:

`addOne`

which should return `index + 1`.

If the project already has a subject serial number in the data model, use that instead.

## Expected rendering

Use Puppeteer/Chromium (or the project's existing HTML-to-PDF renderer) with:

- CSS print colors enabled
- zero page margins
- background graphics enabled
- one marksheet per page
- no browser header/footer

## Data fields

Core fields:

- document_title
- document_number
- academic_session
- student_name
- date_of_birth
- date_of_birth_words
- gender
- father_name
- mother_name
- candidate_roll_no
- student_photo
- subjects[]
- maximum_total
- marks_total
- percentage
- percentage_in_words
- school_name
- school_code
- school_address
- school_website
- school_email
- examination_name
- examination_month
- certificate_number
- issued_on
- verification_url
- qr_code_data_url

Each subject:

- subject_area
- isced_code
- subject_name
- maximum_marks
- marks_obtained

## Production requirements for AGY

1. Preserve the exact source aspect ratio.
2. Calibrate all coordinates against the supplied blank artwork.
3. Ensure long student/school names wrap without colliding with the photo.
4. Handle variable subject counts safely.
5. Prevent a result table from overflowing the fixed page.
6. Generate QR code per student.
7. Generate PDFs server-side.
8. Keep the template controlled by Super Admin; staff must not upload/replace official artwork.
9. Version templates so old results always render with the exact template version used when published.
10. Add visual regression testing: render sample PDF → compare against the supplied populated reference.

## Suggested architecture

Result JSON
→ Handlebars template
→ HTML/CSS
→ Chromium/Puppeteer
→ PDF
→ stored/published result document

For bulk generation:

approved results
→ queue/batch
→ render each result
→ combine PDFs if requested
→ return downloadable batch
