// Relationships

// Archetype
//  ├── services: Service[]
//  │     ├── serviceLines: ServiceLine[]
//  │     ├── archetypes: Archetype[] 🔁
//  │     └── capabilities: Capability[]
//  │           ├── capabilityType: CapabilityType
//  │           └── competencies: Competency[]
//  │                 ├── competency_group: CompetencyGroup
//  │                 └── competency_level: CompetencyLevelBehavior[]
//  │                       └── competency_level: CompetencyLevel
//  └── archetype_expectations: ArchetypeExpectation[]
//        ├── competency: Competency
//        └── competency_level: CompetencyLevel

type ServiceLine = {
  identifier: string;
  description: string;
};

type Archetype = {
  id: string;
  name: string;
  description: string;
  services: Service[];
  activities: string[];
  hub: string;
  base_archetype: Archetype;
  category: string;
  archetype_family: string;
  archetype_expectations: ArchetypeExpectation[];
};

type ArchetypeExpectation = {
  competency: Competency;
  competency_level: CompetencyLevel;
  behavior: string;
};

type Service = {
  identifier: string;
  short_description: string;
  serviceLines: ServiceLine[];
  archetypes: Archetype[];
  capabilities: Capability[];
};

type CapabilityType = {
  id: string;
  name: string;
};

type CompetencyGroup = {
  id: string;
  name: string;
  description: string;
};

type Capability = {
  id: string;
  name: string;
  description: string;
  capabilityType: CapabilityType;
  competencies: Competency[];
};

type Competency = {
  competency_group: CompetencyGroup;
  id: string;
  name: string;
  description: string;
  competency_level: CompetencyLevelBehavior[];
};

type CompetencyLevelBehavior = {
  competency_level: CompetencyLevel;
  behavior: string;
};

type CompetencyLevel = {
  id: string;
  name:
    | "novice"
    | "advanced beginner"
    | "practitioner"
    | "proficient"
    | "expert";
  description: string;
  order: number;
};

const serviceLines: ServiceLine[] = [
  {
    description:
      "Transforming data into a catalyst for innovation, intelligent decision-making and scalable  AI solutions, our data-as-a-product approach unlocks lasting competitive advantage.",
    identifier: "data-modernization",
  },
];
