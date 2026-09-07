export interface DocumentTemplate {
  id: string
  label: string
  content: (title: string) => string
}

export const documentTemplates: DocumentTemplate[] = [
  { id: 'blank', label: 'Blank', content: () => '' },
  {
    id: 'readme',
    label: 'README',
    content: (title) => `# ${title}\n\n## Overview\n\nDescribe what this project does.\n\n## Installation\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Usage\n\n\`\`\`bash\nnpm run start\n\`\`\`\n\n## License\n\nMIT\n`,
  },
  {
    id: 'api',
    label: 'API Documentation',
    content: (title) => `# ${title}\n\n## Authentication\n\nDescribe how clients authenticate.\n\n## Endpoints\n\n### \`GET /resource\`\n\nDescription of the endpoint.\n\n| Parameter | Type | Description |\n| --- | --- | --- |\n| \`id\` | string | Resource identifier |\n\n## Errors\n\n- \`400\` — Bad request\n- \`404\` — Not found\n`,
  },
  {
    id: 'meeting',
    label: 'Meeting Notes',
    content: (title) => `# ${title}\n\n**Date:** \n**Attendees:** \n\n## Agenda\n\n1. \n2. \n\n## Notes\n\n## Action Items\n\n- [ ] \n- [ ] \n`,
  },
  {
    id: 'spec',
    label: 'Technical Specification',
    content: (title) => `# ${title}\n\n## Problem Statement\n\n## Goals\n\n## Non-Goals\n\n## Proposed Design\n\n## Alternatives Considered\n\n## Open Questions\n`,
  },
  {
    id: 'project',
    label: 'Project Documentation',
    content: (title) => `# ${title}\n\n## Summary\n\n## Scope\n\n## Milestones\n\n| Milestone | Target Date | Status |\n| --- | --- | --- |\n\n## Risks\n`,
  },
  {
    id: 'sop',
    label: 'SOP',
    content: (title) => `# ${title}\n\n## Purpose\n\n## Scope\n\n## Procedure\n\n1. \n2. \n3. \n\n## Responsible Roles\n\n## Revision History\n`,
  },
  {
    id: 'architecture',
    label: 'Architecture Document',
    content: (title) => `# ${title}\n\n## Context\n\n## System Overview\n\n## Components\n\n## Data Flow\n\n## Trade-offs\n`,
  },
]
