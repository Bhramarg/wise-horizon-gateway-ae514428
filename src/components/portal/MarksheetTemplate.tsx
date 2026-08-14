import React from "react";
import "./MarksheetTemplate.css";

export interface MarksheetTemplateProps {
  data: any;
  backgroundUrl: string;
}

export const MarksheetTemplate = React.forwardRef<HTMLDivElement, MarksheetTemplateProps>(
  ({ data, backgroundUrl }, ref) => {
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
    } = data;

    const father = guardians?.find((g: any) => g.relation?.toLowerCase() === "father")?.name || "—";
    const mother = guardians?.find((g: any) => g.relation?.toLowerCase() === "mother")?.name || "—";
    
    // We compute total marks max since the database just has total percentage. Wait, no, we need maximum total.
    const maximumTotal = marks?.reduce((sum: number, m: any) => sum + m.maxScore, 0) || 0;
    const obtainedTotal = marks?.reduce((sum: number, m: any) => sum + m.score, 0) || 0;
    
    // Fallback if not all marks are present but total is.
    const percentage = total || (maximumTotal ? (obtainedTotal / maximumTotal * 100).toFixed(2) : "0");

    const formattedDob = dateOfBirth ? new Date(dateOfBirth).toLocaleDateString("en-GB").replace(/\//g, " - ") : "—";
    const issuedDate = issuedAt ? new Date(issuedAt).toLocaleDateString("en-GB") : "—";

    return (
      <div className="marksheet-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
        <div 
          ref={ref} 
          className="marksheet" 
          style={{ 
            backgroundImage: `url(${backgroundUrl})`,
            // Need to ensure the font size base remains scalable
          }}
        >
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
              <div className="candidate-label">Date of Birth in Words</div>
              <div className="candidate-value">: {formattedDob}</div> {/* You could use a number-to-words library here */}
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

        </div>
      </div>
    );
  }
);
MarksheetTemplate.displayName = "MarksheetTemplate";
