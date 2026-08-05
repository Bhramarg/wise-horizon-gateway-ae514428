# Wise-NEW

deisgn a home page with multi menu (build menu pages with no content) 

you do it for WISE. Wise is an accrediation body based in switzerland. 

you will only build landing page. - long, full of amination. acrylic, mica bright white page, engaging page. with aminations. extra large menu navigation. above top header show scrolling line of european and unesco news. show wether and tempratutre. 
2nd page you desgin is "My Wise" - on the top head of the home page provide a button called my wise - this will show an amazing login page. 
use database as neon. the demo env is as follow: 
DATABASE_URL='postgresql://neondb_owner:npg_k2lueMhKPgB6@ep-twilight-pine-a7ispy0e-pooler.ap-southeast-2.aws.neon.tech/wise-online?sslmode=require&channel_binding=require'
GOOGLE_CLIENT_ID='@secret:GOOGLE_OAUTH_CLIENT_ID '
GOOGLE_CLIENT_SECRET='@secret:GOOGLE_OAUTH_CLIENT_SECRET '
VITE_GOOGLE_CLIENT_ID='@secret:GOOGLE_OAUTH_CLIENT_ID '
VITE_GOOGLE_CLIENT_SECRET='@secret:GOOGLE_OAUTH_CLIENT_SECRET '
VITE_API_URL='https://wise.weqsc.org/api/v1'
FRONTEND_URL='https://wise.weqsc.org'

menu structure:

├── _ Home (The Landing Page)

│   └── (Dynamic Content: Breaking News, Official Announcements from UNESCO/Swiss Gov, Quick Stats on Accredited Schools, Ministerial/Secretary Messages)

│

├── about-wize/

│   ├── index.md (The WEQSC-WISE Mission)

│   ├── history-foundation/ (Origins under the UNESCO umbrella)

│   ├── governance-structure/

│   │   ├── board-of-trustees/ (UNESCO Representatives, Swiss Federal Council)

│   │   ├── executive-committee/

│   │   └── national-committees/ (Liaisons with Global Governments)

│   ├── strategic-partners/

│   │   ├── unesco-relations/ (Core Partnership & Reciprocal Recognition) [citation:1]

│   │   ├── council-of-europe/ (Framework for European Region)

│   │   ├── global-governmental-orgs/ (MOUs with Ministries of Education) [citation:8]

│   │   └── european-union/ (Alignment with EQF/ECTS) [citation:12]

│   └── careers/

│

├── recognition-and-standards/ (This is the Policy & Regulatory Core)

│   ├── index.md (The Global Framework)

│   ├── unesco-conventions/

│   │   ├── lisbon-recognition-convention/ (The core treaty)

│   │   ├── recommendation-on-international-access-qualifications/ (The specific 1999 recommendation) [citation:1]

│   │   └── global-recognition-agreements/

│   ├── european-regulatory-framework/ (Compliance & Standards)

│   │   ├── eqf-alignment/ (European Qualifications Framework)

│   │   └── ehea-standards/ (Bologna Process alignment)

│   ├── swiss-education-system/

│   │   ├── federalism-and-cantons/ (The 26 Cantons system explained) [citation:2]

│   │   ├── compulsory-education-regulations/ (Public vs. Private standards)

│   │   ├── recognition-of-foreign-qualifications/ (How WISE supports Swiss universities) [citation:8]

│   │   └── seri-and-educationsuisse-relations/ (State Secretariat for Education role) [citation:10]

│   └── global-government-policies/ (Country-specific recognition agreements)

│       ├── eu-member-state-directives/

│       ├── north-american-equivalency/

│       ├── asian-pacific-recognition/

│       └── commonwealth-and-african-union/

│

├── accreditation/ (The Complete Lifecycle for Schools)

│   ├── index.md (Why WISE Accreditation matters)

│   ├── for-schools-international/ (Primary Candidate)

│   │   ├── application-process/ (Multi-step procedure)

│   │   │   ├── expression-of-interest/

│   │   │   ├── self-evaluation-report/ (Submission portal and guidance)

│   │   │   ├── verification-site-visit/ (WISE Inspectorate process)

│   │   │   └── accreditation-decision/ (Provisional vs. Full)

│   │   ├── standards-criteria/

│   │   │   ├── leadership-and-management/ (Input Criteria)

│   │   │   ├── curriculum-and-pedagogy/ (Curriculum, Teaching, Assessment standards)

│   │   │   ├── staff-qualifications/ (Teacher and Administrator requirements)

│   │   │   └── school-ethos-and-infrastructure/ (Values, safety, facilities)

│   │   ├── fees-and-timeline/ (The financial and scheduling commitment)

│   │   └── resources-for-candidates/ (How-to guides, templates)

│   ├── for-governments/ (Equivalency for State Systems)

│   │   ├── state-recognition-agreements/

│   │   └── benchmarking-process/ (Mapping curricula to WISE standards)

│   ├── accredited-school-directory/

│   │   └── (Dynamic, filterable global database)

│   └── monitoring-and-compliance/ (Post-accreditation)

│       ├── biennial-monitoring-reports/

│       └── withdrawal-of-accreditation-protocols/ (Non-compliance process) [citation:5][citation:9]

│

├── examinations/ (The Pre-College Qualification System)

│   ├── index.md (The WISE International Secondary Examination)

│   ├── the-examination-system/

│   │   ├── structure-and-subjects/ (Curriculum, core & electives)

│   │   ├── assessment-philosophy/ (Attainment referencing & grading)

│   │   └── global-benchmarking/ (Comparisons with IB, A-Levels, Swiss Matura) [citation:4]

│   ├── for-schools-exam-centres/ (School Administration)

│   │   ├── registration-as-examination-centre/ (Becoming a WISE Test Centre)[citation:3]

│   │   ├── internal-assessment-guidelines/ (School's role in continuous assessment)

│   │   ├── conduct-and-security-protocols/ (Examination day rules, security)[citation:5]

│   │   └── exam-administration-tools/ (Candidate entry, data submission portals)

│   ├── for-students/ (Candidate Information)

│   │   ├── registration-guidance/ (How to register, deadlines)

│   │   ├── examination-calendar/ (Worldwide schedule)

│   │   ├── past-papers-and-resources/ (Secure Download Portal)

│   │   └── special-considerations/ (Access arrangements, private candidates) [citation:11]

│   └── results-certificates/

│       ├── results-release/ (Policy & Date)

│       ├── certificate-verification/ (Public tool for universities/employers)

│       └── certification-policy/ (Rules on replacement, re-marking)

│

├── government-relations/ (The Diplomatic & Public Facing Section)

│   ├── index.md (WISE in the Global Policy Arena)

│   ├── ministry-of-education-portal/ (Resources for National Authorities)

│   │   ├── policy-advocacy/

│   │   ├── data-and-reports/

│   │   └── implementing-recognition-decrees/ (Draft templates for governments)

│   ├── european-affairs/ (Focus on EU, Council of Europe)

│   ├── swiss-federal-affairs/ (Swiss specific updates and bilateral dialogues)

│   └── international-organizations/ (WHO, OECD, etc.)

│

├── news-events/ (Communication Hub)

│   ├── press-releases/ (Official statements)

│   ├── announcements/ (Official notices, policy changes)

│   ├── events/ (Conferences, webinars, board meetings)

│   └── industry-research/ (WISE impact studies, whitepapers)

│

├── resources-library/

│   ├── publications/ (Annual report, Strategic plan)

│   ├── policies-and-procedures/ (The 'Code of Conduct' and 'Privacy Policy') [citation:3]

│   │   ├── legal-framework/

│   │   └── data-protection-policy/ (General Data Protection Regulation (GDPR) compliant)

│   ├── faqs/ (Dedicated for Schools, Governments, Students)

│   └── media-kit/ (Brand assets, logos)

│

├── portal-login/ (The Secure Digital Ecosystem)

│   ├── school-accreditation-portal/ (For applications, reporting)

│   ├── exam-centre-portal/ (For exam logistics, results management)

│   └── government-recognition-portal/ (For recognizing authorities to verify status)

│

└── contact-us/ (Official channels)

    ├── geneva-hq/ (Address, key contacts, map)

    ├── regional-liaison-offices/ (Directories)

    └── enquiry-form/ (Categorised for speed)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/418c1842-c655-4e8d-96db-ea7426c16a50).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
