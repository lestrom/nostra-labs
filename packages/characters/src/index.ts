import MrsBeautyBaseCharacter from "./data/mrsbeauty.character.json";
import Knowledge from "./data/knowledge.json";
const MrsBeautyKnowledgeCharacter = {
  ...Knowledge,
  ...MrsBeautyBaseCharacter,
};

export { MrsBeautyBaseCharacter, Knowledge, MrsBeautyKnowledgeCharacter };
