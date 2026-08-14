import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import "./MarksheetTemplate.css";

export interface MarksheetTemplateProps {
  data: any;
  layout?: any; // The certificate layout from database
}

export const MarksheetTemplate = React.forwardRef<HTMLDivElement, MarksheetTemplateProps>(
  ({ data, layout }, ref) => {
    // Extract fields
    const {
      verificationCode,
      learner,
      studentNumber,
      programme,
      dateOfBirth,
      gender,
      guardians,
      qualification,
      academicPeriod,
      institution,
      issuedAt,
      marks,
      total,
      grade,
      birthmark,
      face_id_number,
      country,
    } = data;

    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    
    useEffect(() => {
      if (verificationCode) {
        QRCode.toDataURL(`https://wise.weqsc.org/verify/${verificationCode}`)
          .then(url => setQrCodeUrl(url))
          .catch(console.error);
      }
    }, [verificationCode]);

    const father = guardians?.find((g: any) => g.relation?.toLowerCase() === "father")?.name || "—";
    const mother = guardians?.find((g: any) => g.relation?.toLowerCase() === "mother")?.name || "—";
    
    // We compute total marks max since the database just has total percentage. Wait, no, we need maximum total.
    const maximumTotal = marks?.reduce((sum: number, m: any) => sum + m.maxScore, 0) || 0;
    const obtainedTotal = marks?.reduce((sum: number, m: any) => sum + m.score, 0) || 0;
    
    // Fallback if not all marks are present but total is.
    const percentage = total || (maximumTotal ? (obtainedTotal / maximumTotal * 100).toFixed(2) : "0");

    const formattedDob = dateOfBirth ? new Date(dateOfBirth).toLocaleDateString("en-GB").replace(/\//g, " - ") : "—";
    const issuedDate = issuedAt ? new Date(issuedAt).toLocaleDateString("en-GB") : "—";

    const backgroundUrl = layout?.background_url || (qualification === "L2" ? "/bg1.png" : "/bg2.png");
    const elements = layout?.fields?.elements || (Array.isArray(layout?.fields) ? layout.fields : []);
    const customHtml = layout?.fields?.customHtml || "";
    const customCss = layout?.fields?.customCss || "";

    const fieldMap: Record<string, string> = {
      "{{ learner_name }}": learner || "",
      "{{ student_number }}": studentNumber || "",
      "{{ programme }}": programme || "",
      "{{ date_of_birth }}": formattedDob || "",
      "{{ gender }}": gender || "",
      "{{ caste }}": data.caste || "",
      "{{ address }}": data.address || "",
      "{{ country }}": data.metadata?.country || country || "",
      "{{ birthmark }}": birthmark || "",
      "{{ face_id_number }}": face_id_number || "",
      "{{ father_name }}": father || "",
      "{{ mother_name }}": mother || "",
      "{{ qualification }}": qualification || "",
      "{{ academic_period }}": academicPeriod || "",
      "{{ institution }}": institution || "",
      "{{ total_marks }}": String(maximumTotal),
      "{{ obtained_marks }}": String(obtainedTotal),
      "{{ percentage }}": percentage + "%",
      "{{ grade }}": grade || "",
      "{{ issued_date }}": issuedDate,
      "{{ verification_code }}": verificationCode || ""
    };

    let marksTableHtml = "";
    if (marks && marks.length > 0) {
      marksTableHtml = `
<table class="wise-marks-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="border-bottom: 1px solid #ccc; text-align: left;">
      <th style="padding: 8px;">Sr No</th>
      <th style="padding: 8px;">Subject Area</th>
      <th style="padding: 8px;">ISCED Code</th>
      <th style="padding: 8px;">Subject Name</th>
      <th style="padding: 8px;">Max Marks</th>
      <th style="padding: 8px;">Min Marks</th>
      <th style="padding: 8px;">Obtained</th>
      <th style="padding: 8px;">Grade</th>
    </tr>
  </thead>
  <tbody>
    ${marks.map((m: any, i: number) => {
      const idx = i + 1;
      const [code, ...nameParts] = m.subject.includes("·") ? m.subject.split("·") : ["", m.subject];
      const name = nameParts.join("·") || m.subject;
      const isced = code ? code.trim() : "";
      const minMarks = m.passing || Math.round(m.maxScore * 0.33); // basic fallback if no passing
      const scoreNum = Number(m.score);
      const subjGrade = scoreNum >= m.maxScore * 0.9 ? 'A+' : scoreNum >= m.maxScore * 0.8 ? 'A' : scoreNum >= m.maxScore * 0.7 ? 'B' : scoreNum >= m.maxScore * 0.6 ? 'C' : scoreNum >= m.maxScore * 0.5 ? 'D' : scoreNum >= minMarks ? 'E' : 'F';
      
      // Assign individual subject placeholders
      fieldMap[\`{{ subject_\${idx}_name }}\`] = name.trim();
      fieldMap[\`{{ subject_\${idx}_isced }}\`] = isced;
      fieldMap[\`{{ subject_\${idx}_max }}\`] = String(m.maxScore);
      fieldMap[\`{{ subject_\${idx}_min }}\`] = String(minMarks);
      fieldMap[\`{{ subject_\${idx}_score }}\`] = String(m.score);
      fieldMap[\`{{ subject_\${idx}_grade }}\`] = subjGrade;

      return \`
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">\${idx}</td>
        <td style="padding: 8px;">\${m.category || 'General'}</td>
        <td style="padding: 8px;">\${isced}</td>
        <td style="padding: 8px;">\${name.trim()}</td>
        <td style="padding: 8px;">\${m.maxScore}</td>
        <td style="padding: 8px;">\${minMarks}</td>
        <td style="padding: 8px;">\${m.score}</td>
        <td style="padding: 8px;">\${subjGrade}</td>
      </tr>\`;
    }).join("")}
  </tbody>
</table>`;
    }

    const summaryTableHtml = `
<table class="wise-summary-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr style="border-bottom: 1px solid #ccc; text-align: left;">
      <th style="padding: 8px;">Maximum Marks</th>
      <th style="padding: 8px;">Marks Obtained</th>
      <th style="padding: 8px;">Percentage</th>
      <th style="padding: 8px;">Overall Grade</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px;">${maximumTotal}</td>
      <td style="padding: 8px;">${obtainedTotal}</td>
      <td style="padding: 8px;">${percentage}%</td>
      <td style="padding: 8px;">${grade || "—"}</td>
    </tr>
  </tbody>
</table>`;

    // If customHtml is provided, we replace placeholders
    let renderedHtml = customHtml;
    if (customHtml) {
      renderedHtml = renderedHtml
        .replace(/{{ ?marks_table ?}}/g, marksTableHtml)
        .replace(/{{ ?summary_table ?}}/g, summaryTableHtml)
        .replace(/{{ ?qr_code ?}}/g, qrCodeUrl ? `<img src="${qrCodeUrl}" class="wise-qr-code" style="width:100px; height:100px;" alt="QR Code" />` : "");

      Object.entries(fieldMap).forEach(([key, value]) => {
        // Create regex to match the key regardless of spacing
        const safeKey = key.replace(/([{}])/g, "\\$1").replace(/ /g, " ?");
        renderedHtml = renderedHtml.replace(new RegExp(safeKey, "g"), value);
      });
    }

    return (
      <div className="marksheet-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
        <div 
          ref={ref} 
          className="marksheet" 
          style={{ 
            backgroundImage: `url(${backgroundUrl})`,
            position: "relative"
          }}
        >
          {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
          
          {customHtml ? (
             <div className="absolute inset-0 z-0" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          ) : (
            <>
              {(!elements || elements.length === 0) && (
                <>
                  {/* Candidate information */}
                  <section className="candidate-block">
                    <div className="candidate-row">
                      <div className="candidate-label">Document Number</div>
                      <div className="candidate-value">: {verificationCode}</div>
                    </div>
                    <div className="candidate-row">
                      <div className="candidate-label">Academic Session</div>
                      <div className="candidate-value">: {academicPeriod}</div>
                    </div>
                    <div className="candidate-row">
                      <div className="candidate-label">Student Name</div>
                      <div className="candidate-value">: {learner}</div>
                    </div>
                    <div className="candidate-row">
                      <div className="candidate-label">Date of Birth</div>
                      <div className="candidate-value">: {formattedDob}</div>
                    </div>
                    <div className="candidate-row">
                      <div className="candidate-label">Gender</div>
                      <div className="candidate-value">: {gender || "—"}</div>
                    </div>
                    <div className="candidate-row">
                      <div className="candidate-label">Father's Name</div>
                      <div className="candidate-value">: {father}</div>
                    </div>
                    <div className="candidate-row">
                      <div className="candidate-label">Mother's Name</div>
                      <div className="candidate-value">: {mother}</div>
                    </div>
                    <div className="candidate-row">
                      <div className="candidate-label">Candidate Roll No.</div>
                      <div className="candidate-value">: {studentNumber}</div>
                    </div>
                  </section>

                  {/* Dynamic subject/result table */}
                  {marks && marks.length > 0 && (
                    <section className="results-table-wrap">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th className="c-no">S.<br />NO.</th>
                            <th className="c-area">SUBJECT NAME</th>
                            <th className="c-max">MAXIMUM<br />MARKS</th>
                            <th className="c-got">MARKS<br />OBTAINED</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marks.map((m: any, idx: number) => {
                            const [code, ...nameParts] = m.subject.includes("·") ? m.subject.split("·") : ["", m.subject];
                            const name = nameParts.join("·") || m.subject;
                            return (
                              <tr key={idx}>
                                <td className="c-no num">{idx + 1}</td>
                                <td className="c-area">{name.trim()} {code ? `(${code.trim()})` : ""}</td>
                                <td className="c-max num">{m.maxScore}</td>
                                <td className="c-got num">{m.score}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="summary">
                        <div className="summary-title">TOTAL SUMMARY</div>
                        <div className="summary-cell">
                          <div className="summary-label">MAXIMUM<br />MARKS:</div>
                          <div className="summary-value">{maximumTotal}</div>
                        </div>
                        <div className="summary-cell">
                          <div className="summary-label">MARKS<br />OBTAINED:</div>
                          <div className="summary-value">{obtainedTotal}</div>
                        </div>
                        <div className="summary-cell summary-percent">
                          <div className="summary-label">PERCENTAGE:</div>
                          <div className="summary-value">{percentage}%</div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* School and certification */}
                  <section className="school-block">
                    <div className="school-row">
                      <div className="school-label">School Name:</div>
                      <div className="school-value">{institution}</div>
                    </div>
                    <div className="certification">
                      This marksheet is issued under the academic evaluation framework of the World Education Quality
                      Standards Commission (WEQSC) and is aligned with the UNESCO ISCED 1997 Level classification
                      of education.<br />
                      This is to certify that <strong>{learner}</strong> has successfully completed the
                      {" "}{qualification} with {percentage}% percentage for the exam held during {academicPeriod}.
                    </div>
                  </section>

                  {/* Verification / certificate metadata / QR */}
                  <section className="bottom-dynamic">
                    <div className="certificate-line">Certificate No.: {verificationCode} &nbsp;|&nbsp; Issued on: {issuedDate}</div>
                    <div className="verification">Verify at: https://wise.weqsc.org/verify/{verificationCode}</div>
                  </section>
                </>
              )}
            </>
          )}

          {/* Absolute positioned drag and drop fields */}
          {elements && elements.length > 0 && elements.map((f: any) => {
            const left = f.xPct * 100 + "%";
            const top = f.yPct * 100 + "%";
            const fs = f.fontSize; // Unscaled font size for actual PDF
            
            // Replace placeholders for dynamic text if it matches one
            let displayValue = f.name;
            // Support spaced placeholders by normalizing
            const normalizedName = f.name.replace(/ /g, "");
            for (const key of Object.keys(fieldMap)) {
              if (key.replace(/ /g, "") === normalizedName) {
                displayValue = fieldMap[key];
                break;
              }
            }

            if (f.name === "{{ qr_code }}") {
              return (
                <div
                  key={f.id}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width: (f.widthPct * 100) + "%",
                    zIndex: 10
                  }}
                >
                  {qrCodeUrl && <img src={qrCodeUrl} style={{ width: "100px", height: "100px", maxWidth: "100%" }} alt="QR Code" />}
                </div>
              );
            }

            return (
              <div
                key={f.id}
                style={{
                  position: "absolute",
                  left,
                  top,
                  fontSize: fs + "px",
                  color: f.color,
                  fontFamily: f.fontFamily,
                  fontWeight: f.bold ? 700 : 400,
                  fontStyle: f.italic ? "italic" : "normal",
                  textAlign: f.align,
                  width: (f.widthPct * 100) + "%",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.2,
                  zIndex: 10
                }}
              >
                {displayValue}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
MarksheetTemplate.displayName = "MarksheetTemplate";
