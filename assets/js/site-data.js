window.SITE_DATA = {
  profile: {
    name: "Lei Zhang",
    pronouns: "(he/him)",
    role: "Postdoctoral Researcher",
    organization: "Ruhr University Bochum (ICAMS)",
    avatar: "assets/files/profile-1.png",
    avatarPosition: "50% 50%",
    avatarZoom: 1.8,
    avatarFit: "contain",
    avatarOffsetX: "-20px",
    avatarOffsetY: "-5px",
    summary: [
      "Postdoctoral researcher applying NLP and machine learning for data-driven electrocatalyst discovery.",
      "Creator of MatNexus, an open-source framework for automated literature collection, text mining, and embedding-based property prediction. Current work integrates NLP, multi-modal learning, and optimization with experimental validation."
    ],
    cv: {
      label: "Download CV",
      href: "assets/files/Lei_Zhang_CV.pdf",
      download: true
    },
    socials: [
      { label: "Email", short: "@", href: "mailto:Lei.Zhang-w2i@ruhr-uni-bochum.de" },
      { label: "ORCID", short: "iD", href: "https://orcid.org/0009-0003-5842-1932" },
      { label: "Scholar", short: "GS", href: "https://scholar.google.com/citations?user=G-WvdhIAAAAJ" },
      { label: "ResearchGate", short: "RG", href: "https://www.researchgate.net/profile/Lei-Zhang-871" }
    ]
  },

  nav: [
    { page: "bio", label: "Bio", file: "index.html" },
    { page: "papers", label: "Papers", file: "papers.html" },
    { page: "talks", label: "Talks", file: "talks.html" },
    { page: "news", label: "News", file: "news.html" },
    { page: "experience", label: "Experience", file: "experience.html" },
    { page: "projects", label: "Projects", file: "projects.html" },
    { page: "teaching", label: "Teaching", file: "teaching.html" }
  ],

  sections: {
    bio: {
      title: "Professional Summary",
      description: "",
      education: [
        {
          title: "PhD in Materials Science (2022-2025)",
          subtitle: "Ruhr University Bochum (ICAMS), Germany"
        },
        {
          title: "Master's Degree in Materials Science (2019-2022)",
          subtitle: "NanChang Hangkong University, China"
        },
        {
          title: "Bachelor's Degree in Welding Technology (2013-2017)",
          subtitle: "NanChang Hangkong University, China"
        }
      ]
    },

    papers: {
      title: "Publications",
      description: "",
      items: [
        {
          title: "Computationally accelerated experimental materials characterization",
          subtitle: "Nature Communications (2026)",
          meta: "Stricker, M., Banko, L., Sarazin, N., Siemer, N., Janssen, J., Zhang, L., Neugebauer, J., Ludwig, A.",
          kind: "published",
          year: 2026,
          links: [
            { label: "DOI", href: "https://doi.org/10.1038/s41524-025-01919-5" }
          ]
        },
        {
          title: "Composition-property extrapolation for compositionally complex solid solutions based on word embeddings",
          subtitle: "Digital Discovery (2025)",
          meta: "Zhang, L., Banko, L., Schuhmann, W., Ludwig, A., Stricker, M.",
          kind: "published",
          year: 2025,
          links: [
            { label: "DOI", href: "https://doi.org/10.1039/D5DD00169B" },
            { label: "Demo", href: "projects.html?subtab=standard-vector-demo" }
          ]
        },
        {
          title: "Iterative Corpus Refinement for Materials Property Prediction Based on Scientific Texts",
          subtitle: "ECML PKDD (2025)",
          meta: "Zhang, L. and Stricker, M.",
          kind: "published",
          year: 2025,
          links: [
            { label: "DOI", href: "https://doi.org/10.1007/978-3-032-06118-8_6" },
            { label: "Demo", href: "projects.html?subtab=iterative-paper-selection-demo" }
          ]
        },
        {
          title: "Electrocatalyst discovery through text mining and multi-objective optimization",
          subtitle: "arXiv preprint (2025)",
          meta: "Zhang, L. and Stricker, M.",
          kind: "preprint",
          year: 2025,
          links: [
            { label: "arXiv", href: "https://arxiv.org/abs/2502.20860" },
            { label: "Demo", href: "projects.html?subtab=pareto-front-demo" }
          ]
        },
        {
          title: "MatNexus: A comprehensive text mining and analysis suite for materials discovery",
          subtitle: "SoftwareX (2024)",
          meta: "Zhang, L. and Stricker, M.",
          kind: "published",
          year: 2024,
          description: "Introduces MatNexus for automated text mining and analysis in materials discovery.",
          links: [
            { label: "DOI", href: "https://doi.org/10.1016/j.softx.2024.101654" },
            { label: "Demo", href: "projects.html?subtab=word-embedding-demo" }
          ]
        },
        {
          title: "P-Ni co-doped Mo2C embedded in carbon-fiber paper for alkaline HER",
          subtitle: "Diamond and Related Materials 143 (2024)",
          meta: "Ding, T., Zhang, L., Huang, J., et al.",
          kind: "published",
          year: 2024,
          links: [
            { label: "DOI", href: "https://doi.org/10.1016/j.diamond.2024.110942" }
          ]
        },
        {
          title: "Ni-doped WC/Mo2C on CFP via molten salt for HER",
          subtitle: "Ceramics International 49(11A) (2023)",
          meta: "Luo, Z., Zhang, L., Huang, J., et al.",
          kind: "published",
          year: 2023,
          links: [
            { label: "DOI", href: "https://doi.org/10.1016/j.ceramint.2023.02.073" }
          ]
        },
        {
          title: "Ni(NO3)2-induced WC coating on CFP for HER via molten salt",
          subtitle: "Electrochimica Acta 422 (2022)",
          meta: "Zhang, L., Huang, J., Li, X., et al.",
          kind: "published",
          year: 2022,
          links: [
            { label: "DOI", href: "https://doi.org/10.1016/j.electacta.2022.140553" }
          ]
        },
        {
          title: "Experimental and DFT studies of Ni-doped Mo2C on CFP for HER",
          subtitle: "Journal of Advanced Ceramics 11(8) (2022)",
          meta: "Zhang, L., Hu, Z., Huang, J., et al.",
          kind: "published",
          year: 2022,
          links: [
            { label: "DOI", href: "https://doi.org/10.1007/s40145-022-0610-6" }
          ]
        },
        {
          title: "Self-supported Ni-doped Mo2C nanoflowers on CFP for HER",
          subtitle: "Nanoscale 13(17) (2021)",
          meta: "Hu, Z., Zhang, L., Huang, J., et al.",
          kind: "published",
          year: 2021,
          links: [
            { label: "DOI", href: "https://doi.org/10.1039/d1nr00169h" }
          ]
        },
        {
          title: "Molten salt synthesis of TiC using carbon templates",
          subtitle: "Ceramics International 47(12) (2021)",
          meta: "Yan, M., Xiong, Q., Huang, J., Zhang, L., et al.",
          kind: "published",
          year: 2021,
          links: [
            { label: "DOI", href: "https://doi.org/10.1016/j.ceramint.2021.03.077" }
          ]
        },
        {
          title: "Graphene-based SiC nanowires with nanosheets",
          subtitle: "CrystEngComm 22(24) (2020)",
          meta: "Hu, Z., Chen, Z., Huang, J., Yan, M., Zhang, M., Zhang, L., Li, X., Feng, Z.",
          kind: "published",
          year: 2020,
          links: [
            { label: "DOI", href: "https://doi.org/10.1039/d0ce00297f" }
          ]
        },
        {
          title: "CN113072069A",
          subtitle: "Patent",
          kind: "patent",
          year: 2020,
          description: "Master's research patent."
        },
        {
          title: "CN113073351A",
          subtitle: "Patent",
          kind: "patent",
          year: 2020,
          description: "Master's research patent."
        },
        {
          title: "CN110368969A",
          subtitle: "Patent",
          kind: "patent",
          year: 2020,
          description: "Master's research patent."
        }
      ]
    },

    talks: {
      title: "Conference Presentations",
      description: "",
      items: [
        {
          title: "Literature-Based Prediction of High-Performance Electrocatalysts",
          subtitle: "AIMSE2025, Bochum, Germany",
          meta: "2025",
          year: 2025
        },
        {
          title: "Iterative Corpus Refinement for Materials Property Prediction Based on Scientific Texts",
          subtitle: "ECML PKDD, Porto, Portugal",
          meta: "2025",
          year: 2025
        },
        {
          title: "Prediction of quaternary systems based on word embeddings",
          subtitle: "MLM4MS, Ljubljana, Slovenia",
          meta: "2024",
          year: 2024
        },
        {
          title: "Vector analysis for improved prediction of quaternary material systems",
          subtitle: "MMM11, Prague, Czech Republic",
          meta: "2024",
          year: 2024
        },
        {
          title: "MatNexus: text mining suite for materials discovery",
          subtitle: "Early Career Researchers Day, RUB, Bochum, Germany",
          meta: "2024",
          year: 2024
        },
        {
          title: "From text data to word embeddings in Materials Science",
          subtitle: "FEMS EUROMAT, Frankfurt, Germany",
          meta: "2023",
          year: 2023
        },
        {
          title: "MatNexus: systematic text extraction in materials science",
          subtitle: "GC-MAC Summer School, KIT Karlsruhe, Germany",
          meta: "2023",
          year: 2023
        },
        {
          title: "From text data to word embeddings in Materials Science",
          subtitle: "WE-Heraeus-Seminar, Bad Honnef, Germany",
          meta: "2022",
          year: 2022
        }
      ]
    },

    news: {
      title: "News",
      description: "Recent achievements and recognitions.",
      items: [
        {
          title: "Postdoctoral Researcher at Ruhr University Bochum (ICAMS)",
          meta: "2025",
          year: 2025,
          description: "Started postdoctoral work extending MatNexus with NLP, multi-modal learning, and optimization."
        },
        {
          title: "Doctorate with Distinction",
          meta: "2025",
          year: 2025,
          description: "Completed PhD in Materials Science at Ruhr University Bochum."
        },
        {
          title: "Research Fellowship, RUB",
          meta: "2025",
          year: 2025
        },
        {
          title: "First Place, Science Slam (RUB)",
          meta: "2024",
          year: 2024
        },
        {
          title: "CSC Scholarship",
          meta: "2022-2025",
          year: 2022
        },
        {
          title: "First Class Postgraduate Scholarship",
          meta: "2019-2022",
          year: 2019
        }
      ]
    },

    experience: {
      title: "Research Experience",
      description: "Academic and research appointments.",
      items: [
        {
          title: "Postdoctoral Researcher",
          subtitle: "Ruhr University Bochum (ICAMS)",
          meta: "2025 - Present",
          year: 2025,
          bullets: [
            "Extending MatNexus with advanced NLP, multi-modal learning, and optimization for materials discovery.",
            "Leading collaborations with experimental groups to prioritize candidate compositions and validate predictions.",
            "Contributing to CRC 1625, DIMENSION, and COST CA22154 research initiatives."
          ],
          links: [
            { label: "ICAMS", href: "https://www.icams.de/" },
            { label: "CRC 1625", href: "https://www.ruhr-uni-bochum.de/crc1625/" },
            { label: "DIMENSION", href: "https://mercur-research.de/projekte/default-466034e9780fc5fbe19391cd2911c3a5/dimension" }
          ]
        },
        {
          title: "PhD Researcher",
          subtitle: "Ruhr University Bochum (ICAMS)",
          meta: "2022 - 2025",
          year: 2022,
          bullets: [
            "Developed MatNexus for automated literature mining and word-embedding pipelines.",
            "Built Python workflows for data curation, NLP, model training/evaluation, and composition-property prediction.",
            "Collaborated with experimental partners for synthesis guidance and validation."
          ]
        },
        {
          title: "Master's Researcher",
          subtitle: "NanChang Hangkong University",
          meta: "2019 - 2022",
          year: 2019,
          bullets: [
            "Experimental electrocatalyst development including molten-salt synthesis, scale-up, and electrochemical evaluation."
          ]
        }
      ]
    },

    projects: {
      title: "Projects",
      description: "Interactive project demos. Use the tabs below to switch between project tools.",
      subtabs: [
        {
          key: "word-embedding-demo",
          label: "Word Embedding Demo",
          type: "embedding-workbench",
          title: "Element Embedding Workbench",
          description: "Based on MatNexus, this demo builds a weighted composite embedding from selected elements and compares it with property-word embeddings in 2D. It shows how text-derived latent knowledge can support fast materials hypotheses before expensive lab screening.",
          paper: {
            title: "MatNexus: A comprehensive text mining and analysis suite for materials discovery",
            href: "https://doi.org/10.1016/j.softx.2024.101654"
          }
        },
        {
          key: "pareto-front-demo",
          label: "Pareto Front Demo",
          type: "pareto-front-workbench",
          title: "Ternary Composite Pareto Workbench",
          description: "This demo reflects text-mining-driven multi-objective electrocatalyst discovery: it ranks ternary candidates by embedding-based conductivity/dielectric objectives and returns Pareto fronts. Instead of experimentally testing every candidate, you can prioritize a short prediction list and save time and resources, even without direct experimental input at this screening stage.",
          paper: {
            title: "Electrocatalyst discovery through text mining and multi-objective optimization",
            href: "https://arxiv.org/abs/2502.20860"
          }
        },
        {
          key: "iterative-paper-selection-demo",
          label: "Iterative Paper Selection Demo",
          type: "iterative-paper-selection-demo",
          title: "Iterative Corpus Selection and Convergence",
          description: "Not all papers are equally useful for building reliable embeddings. This demo shows iterative corpus refinement that selectively adds informative papers, improving embedding coverage and stabilizing property-prediction behavior.",
          paper: {
            title: "Iterative Corpus Refinement for Materials Property Prediction Based on Scientific Texts",
            href: "https://doi.org/10.1007/978-3-032-06118-8_6"
          }
        },
        {
          key: "standard-vector-demo",
          label: "Standard Vector Demo",
          type: "standard-vector-demo",
          title: "Standard Vector Training Loop",
          description: "This demo shows how word-embedding knowledge can complement limited experimental data: adaptive property weights create a standard vector from training evidence, then candidate composition embeddings are ranked by similarity to prioritize promising extrapolation targets.",
          paper: {
            title: "Composition-property extrapolation for compositionally complex solid solutions based on word embeddings",
            href: "https://doi.org/10.1039/D5DD00169B"
          }
        }
      ]
    },

    teaching: {
      title: "Teaching Experience",
      description: "Mentoring and supervision activities.",
      items: [
        {
          title: "Mentor, Course Project",
          subtitle: "Comparative Analysis of Descriptors in Electrocatalysis",
          meta: "2024",
          year: 2024
        },
        {
          title: "Supervisor, Student Assistant",
          subtitle: "Data collection/analysis and text-mining workflows for materials discovery",
          meta: "2024",
          year: 2024
        }
      ]
    }
  }
};
