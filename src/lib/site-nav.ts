export type NavNode = {
  slug: string;
  label: string;
  blurb?: string | undefined;
  children?: NavNode[];
};

export type NavSection = NavNode & { children: NavNode[] };

export const navigation: NavSection[] = [
  {
    slug: "about-wise",
    label: "About WISE",
    blurb: "Mission, governance and the partnerships that anchor our mandate.",
    children: [
      { slug: "", label: "The WEQSC-WISE Mission", blurb: "Our purpose and mandate" },
      {
        slug: "history-foundation",
        label: "History & Foundation",
        blurb: "Origins under the UNESCO umbrella",
      },
      {
        slug: "governance-structure",
        label: "Governance Structure",
        children: [
          { slug: "board-of-trustees", label: "Board of Trustees" },
          { slug: "executive-committee", label: "Executive Committee" },
          { slug: "national-committees", label: "National Committees" },
        ],
      },
      {
        slug: "strategic-partners",
        label: "Strategic Partners",
        children: [
          { slug: "unesco-relations", label: "UNESCO Relations" },
          { slug: "council-of-europe", label: "Council of Europe" },
          { slug: "global-governmental-orgs", label: "Global Governmental Organisations" },
          { slug: "european-union", label: "European Union" },
        ],
      },
      { slug: "careers", label: "Careers", blurb: "Join the Secretariat" },
    ],
  },
  {
    slug: "recognition-and-standards",
    label: "Recognition & Standards",
    blurb: "The policy and regulatory core of global qualification recognition.",
    children: [
      { slug: "", label: "The Global Framework" },
      {
        slug: "unesco-conventions",
        label: "UNESCO Conventions",
        children: [
          { slug: "lisbon-recognition-convention", label: "Lisbon Recognition Convention" },
          {
            slug: "recommendation-on-international-access-qualifications",
            label: "Recommendation on International Access Qualifications",
          },
          { slug: "global-recognition-agreements", label: "Global Recognition Agreements" },
        ],
      },
      {
        slug: "european-regulatory-framework",
        label: "European Regulatory Framework",
        children: [
          { slug: "eqf-alignment", label: "EQF Alignment" },
          { slug: "ehea-standards", label: "EHEA Standards" },
        ],
      },
      {
        slug: "swiss-education-system",
        label: "Swiss Education System",
        children: [
          { slug: "federalism-and-cantons", label: "Federalism & the 26 Cantons" },
          { slug: "compulsory-education-regulations", label: "Compulsory Education Regulations" },
          {
            slug: "recognition-of-foreign-qualifications",
            label: "Recognition of Foreign Qualifications",
          },
          { slug: "seri-and-educationsuisse-relations", label: "SERI & educationsuisse" },
        ],
      },
      {
        slug: "global-government-policies",
        label: "Global Government Policies",
        children: [
          { slug: "eu-member-state-directives", label: "EU Member State Directives" },
          { slug: "north-american-equivalency", label: "North American Equivalency" },
          { slug: "asian-pacific-recognition", label: "Asian-Pacific Recognition" },
          { slug: "commonwealth-and-african-union", label: "Commonwealth & African Union" },
        ],
      },
    ],
  },
  {
    slug: "accreditation",
    label: "Accreditation",
    blurb: "The complete lifecycle for schools, systems and ministries.",
    children: [
      { slug: "", label: "Why WISE Accreditation Matters" },
      {
        slug: "for-schools-international",
        label: "For International Schools",
        children: [
          {
            slug: "application-process",
            label: "Application Process",
            children: [
              { slug: "expression-of-interest", label: "Expression of Interest" },
              { slug: "self-evaluation-report", label: "Self-Evaluation Report" },
              { slug: "verification-site-visit", label: "Verification Site Visit" },
              { slug: "accreditation-decision", label: "Accreditation Decision" },
            ],
          },
          {
            slug: "standards-criteria",
            label: "Standards & Criteria",
            children: [
              { slug: "leadership-and-management", label: "Leadership & Management" },
              { slug: "curriculum-and-pedagogy", label: "Curriculum & Pedagogy" },
              { slug: "staff-qualifications", label: "Staff Qualifications" },
              { slug: "school-ethos-and-infrastructure", label: "Ethos & Infrastructure" },
            ],
          },
          { slug: "fees-and-timeline", label: "Fees & Timeline" },
          { slug: "resources-for-candidates", label: "Resources for Candidates" },
        ],
      },
      {
        slug: "for-governments",
        label: "For Governments",
        children: [
          { slug: "state-recognition-agreements", label: "State Recognition Agreements" },
          { slug: "benchmarking-process", label: "Benchmarking Process" },
        ],
      },
      { slug: "accredited-school-directory", label: "Accredited School Directory" },
      {
        slug: "monitoring-and-compliance",
        label: "Monitoring & Compliance",
        children: [
          { slug: "biennial-monitoring-reports", label: "Biennial Monitoring Reports" },
          { slug: "withdrawal-of-accreditation-protocols", label: "Withdrawal Protocols" },
        ],
      },
    ],
  },
  {
    slug: "examinations",
    label: "Examinations",
    blurb: "The WISE International Secondary Examination system.",
    children: [
      { slug: "", label: "The WISE International Secondary Examination" },
      {
        slug: "the-examination-system",
        label: "The Examination System",
        children: [
          { slug: "structure-and-subjects", label: "Structure & Subjects" },
          { slug: "assessment-philosophy", label: "Assessment Philosophy" },
          { slug: "global-benchmarking", label: "Global Benchmarking" },
        ],
      },
      {
        slug: "for-schools-exam-centres",
        label: "For Exam Centres",
        children: [
          { slug: "registration-as-examination-centre", label: "Registration as Exam Centre" },
          { slug: "internal-assessment-guidelines", label: "Internal Assessment Guidelines" },
          { slug: "conduct-and-security-protocols", label: "Conduct & Security Protocols" },
          { slug: "exam-administration-tools", label: "Exam Administration Tools" },
        ],
      },
      {
        slug: "for-students",
        label: "For Students",
        children: [
          { slug: "registration-guidance", label: "Registration Guidance" },
          { slug: "examination-calendar", label: "Examination Calendar" },
          { slug: "past-papers-and-resources", label: "Past Papers & Resources" },
          { slug: "special-considerations", label: "Special Considerations" },
        ],
      },
      {
        slug: "results-certificates",
        label: "Results & Certificates",
        children: [
          { slug: "results-release", label: "Results Release" },
          { slug: "certificate-verification", label: "Certificate Verification" },
          { slug: "certification-policy", label: "Certification Policy" },
        ],
      },
    ],
  },
  {
    slug: "government-relations",
    label: "Government Relations",
    blurb: "WISE in the global policy arena.",
    children: [
      { slug: "", label: "WISE in the Global Policy Arena" },
      {
        slug: "ministry-of-education-portal",
        label: "Ministry of Education Portal",
        children: [
          { slug: "policy-advocacy", label: "Policy Advocacy" },
          { slug: "data-and-reports", label: "Data & Reports" },
          { slug: "implementing-recognition-decrees", label: "Implementing Recognition Decrees" },
        ],
      },
      { slug: "european-affairs", label: "European Affairs" },
      { slug: "swiss-federal-affairs", label: "Swiss Federal Affairs" },
      { slug: "international-organizations", label: "International Organizations" },
    ],
  },
  {
    slug: "news-events",
    label: "News & Events",
    blurb: "Official statements, announcements and convenings.",
    children: [
      { slug: "press-releases", label: "Press Releases" },
      { slug: "announcements", label: "Announcements" },
      { slug: "events", label: "Events" },
      { slug: "industry-research", label: "Industry Research" },
    ],
  },
  {
    slug: "resources-library",
    label: "Resources",
    blurb: "Publications, policies and media assets.",
    children: [
      { slug: "publications", label: "Publications" },
      {
        slug: "policies-and-procedures",
        label: "Policies & Procedures",
        children: [
          { slug: "legal-framework", label: "Legal Framework" },
          { slug: "data-protection-policy", label: "Data Protection Policy" },
        ],
      },
      { slug: "faqs", label: "FAQs" },
      { slug: "media-kit", label: "Media Kit" },
    ],
  },
  {
    slug: "portal-login",
    label: "Portals",
    blurb: "The secure digital ecosystem for our stakeholders.",
    children: [
      { slug: "school-accreditation-portal", label: "School Accreditation Portal" },
      { slug: "exam-centre-portal", label: "Exam Centre Portal" },
      { slug: "government-recognition-portal", label: "Government Recognition Portal" },
    ],
  },
  {
    slug: "contact-us",
    label: "Contact",
    blurb: "Official channels and liaison offices.",
    children: [
      { slug: "geneva-hq", label: "Geneva Headquarters" },
      { slug: "regional-liaison-offices", label: "Regional Liaison Offices" },
      { slug: "enquiry-form", label: "Enquiry Form" },
    ],
  },
];

export type FlatNode = {
  path: string;
  label: string;
  blurb?: string | undefined;
  section: NavSection;
  trail: { path: string; label: string }[];
  children: { path: string; label: string }[];
};

function walk(
  nodes: NavNode[],
  parentPath: string,
  section: NavSection,
  trail: { path: string; label: string }[],
  out: Map<string, FlatNode>,
) {
  for (const node of nodes) {
    const path = node.slug ? `${parentPath}/${node.slug}` : parentPath;
    const childTrail = [...trail, { path, label: node.label }];
    out.set(path, {
      path,
      label: node.label,
      blurb: node.blurb,
      section,
      trail: childTrail,
      children: (node.children ?? []).map((c) => ({
        path: c.slug ? `${path}/${c.slug}` : path,
        label: c.label,
      })),
    });
    if (node.children) walk(node.children, path, section, childTrail, out);
  }
}

export const flatNav: Map<string, FlatNode> = (() => {
  const out = new Map<string, FlatNode>();
  for (const section of navigation) {
    const path = `/${section.slug}`;
    const trail = [{ path, label: section.label }];
    out.set(path, {
      path,
      label: section.label,
      blurb: section.blurb,
      section,
      trail,
      children: section.children.map((c) => ({
        path: c.slug ? `${path}/${c.slug}` : path,
        label: c.label,
      })),
    });
    walk(section.children, path, section, trail, out);
  }
  return out;
})();

export function lookupNav(pathname: string): FlatNode | undefined {
  return flatNav.get("/" + pathname.replace(/^\/+|\/+$/g, ""));
}
