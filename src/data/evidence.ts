import campusAipo from '../assets/evidence/campus-aipo-competition.jpg'
import campusEvent from '../assets/evidence/campus-event-organization.jpg'
import campusModelUn from '../assets/evidence/campus-model-un-conference.jpg'
import campusWaarzegger from '../assets/evidence/campus-waarzegger-short-film.jpg'
import campusYourgen from '../assets/evidence/campus-yourgen-project.jpg'
import campusYourgenPromotion1 from '../assets/evidence/campus-yourgen-promotion-1.jpg'
import campusYourgenPromotion2 from '../assets/evidence/campus-yourgen-promotion-2.jpg'
import educationThesis from '../assets/evidence/education-thesis-proposal.png'
import outputAutomation1 from '../assets/evidence/output-automation-platform-1.png'
import outputAutomation2 from '../assets/evidence/output-automation-platform-2.png'
import outputBilingual from '../assets/evidence/output-bilingual-review.png'
import outputCapture from '../assets/evidence/output-cross-platform-capture.png'
import outputDelivery from '../assets/evidence/output-delivery-mechanism.png'
import outputAgentPaas from '../assets/evidence/output-expert-agent-paas.png'
import outputMonsora from '../assets/evidence/output-monsora-workbench.png'
import outputProduct from '../assets/evidence/output-product-orchestration.png'
import outputTeam from '../assets/evidence/output-team-knowledge-sharing.png'
import profileCodex from '../assets/evidence/profile-codex.png'
import profileGithub from '../assets/evidence/profile-github-2026.png'

export type EvidenceLocation = 'header' | 'education' | 'campus' | 'work'

export type EvidenceAsset = {
  id: string
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

export type EvidenceGroup = {
  id: string
  anchor: string
  location: EvidenceLocation
  assets: EvidenceAsset[]
}

export type EvidenceResolver = (sourceText: string) => EvidenceGroup | undefined

function asset(
  id: string,
  src: string,
  caption: string,
  width: number,
  height: number,
): EvidenceAsset {
  return {
    id,
    src,
    alt: `${caption}图片`,
    caption,
    width,
    height,
  }
}

export const evidenceGroups: EvidenceGroup[] = [
  {
    id: 'header-profiles',
    anchor: 'opening personal header',
    location: 'header',
    assets: [
      asset('profile-codex', profileCodex, 'Codex Profile', 783, 732),
      asset(
        'profile-github-2026',
        profileGithub,
        '今年的 GitHub Profile',
        1127,
        713,
      ),
    ],
  },
  {
    id: 'education-thesis',
    anchor: '毕业设计研究方向',
    location: 'education',
    assets: [
      asset(
        'education-thesis-proposal',
        educationThesis,
        '毕业设计开题节选',
        1358,
        1604,
      ),
    ],
  },
  {
    id: 'campus-aipo',
    anchor: 'Way to AGI——AIPO校园创投大赛',
    location: 'campus',
    assets: [
      asset(
        'campus-aipo-competition',
        campusAipo,
        '校园 AIPO 比赛',
        1440,
        960,
      ),
    ],
  },
  {
    id: 'campus-yourgen',
    anchor: '语境YourGen——LLM+外语场景应用开发',
    location: 'campus',
    assets: [
      asset('campus-yourgen-project', campusYourgen, '语境项目', 1620, 1080),
      asset(
        'campus-yourgen-promotion-1',
        campusYourgenPromotion1,
        '地推+YourGen项目',
        1706,
        1280,
      ),
      asset(
        'campus-yourgen-promotion-2',
        campusYourgenPromotion2,
        '地推+YourGen项目2',
        1706,
        1280,
      ),
    ],
  },
  {
    id: 'campus-waarzegger',
    anchor: '荷兰语原创短剧《Waarzegger Kenneth》执导',
    location: 'campus',
    assets: [
      asset(
        'campus-waarzegger-short-film',
        campusWaarzegger,
        'Waarzegger短剧',
        1200,
        3837,
      ),
    ],
  },
  {
    id: 'campus-event',
    anchor: '校企活动组织力',
    location: 'campus',
    assets: [
      asset(
        'campus-event-organization',
        campusEvent,
        '校园活动举办',
        1600,
        1200,
      ),
    ],
  },
  {
    id: 'campus-model-un',
    anchor: '模拟联合国大会——长期活跃的模联选手',
    location: 'campus',
    assets: [
      asset(
        'campus-model-un-conference',
        campusModelUn,
        '模联大会',
        1920,
        1280,
      ),
    ],
  },
  {
    id: 'output-product',
    anchor: '【产品统筹】',
    location: 'work',
    assets: [
      asset(
        'output-product-orchestration',
        outputProduct,
        'OUTPUT 产品统筹',
        1004,
        783,
      ),
    ],
  },
  {
    id: 'output-delivery',
    anchor: '【交付机制建设】',
    location: 'work',
    assets: [
      asset(
        'output-delivery-mechanism',
        outputDelivery,
        'OUTPUT 交付机制建设',
        2919,
        3223,
      ),
    ],
  },
  {
    id: 'output-bilingual',
    anchor: '【双语评审规模化交付】',
    location: 'work',
    assets: [
      asset(
        'output-bilingual-review',
        outputBilingual,
        '双语评审规模化交付',
        1240,
        997,
      ),
    ],
  },
  {
    id: 'output-agent-paas',
    anchor: '【Expert Agent PaaS】',
    location: 'work',
    assets: [
      asset(
        'output-expert-agent-paas',
        outputAgentPaas,
        'Expert Agent PaaS',
        377,
        447,
      ),
    ],
  },
  {
    id: 'output-monsora',
    anchor: '【Monsora 多模态资产工作台】',
    location: 'work',
    assets: [
      asset(
        'output-monsora-workbench',
        outputMonsora,
        'Monsora 多模态资产工作台',
        1485,
        1063,
      ),
    ],
  },
  {
    id: 'output-capture',
    anchor: '【跨平台资产捕捉】',
    location: 'work',
    assets: [
      asset(
        'output-cross-platform-capture',
        outputCapture,
        '跨平台资产捕捉',
        1182,
        1013,
      ),
    ],
  },
  {
    id: 'output-automation',
    anchor: '【自动化与技术研究】',
    location: 'work',
    assets: [
      asset(
        'output-automation-platform-1',
        outputAutomation1,
        '自动化平台1',
        1026,
        1019,
      ),
      asset(
        'output-automation-platform-2',
        outputAutomation2,
        '自动化平台2',
        1028,
        1046,
      ),
    ],
  },
  {
    id: 'output-team',
    anchor: '【团队建设与知识共享】',
    location: 'work',
    assets: [
      asset(
        'output-team-knowledge-sharing',
        outputTeam,
        '团队建设与知识共享',
        1158,
        373,
      ),
    ],
  },
]

export const headerProfileGroup = evidenceGroups[0]

export function createEvidenceResolver(
  location: EvidenceLocation,
  groups: EvidenceGroup[] = evidenceGroups,
): EvidenceResolver {
  const scopedGroups = groups.filter((group) => group.location === location)

  return (sourceText) =>
    scopedGroups.find((group) => sourceText.includes(group.anchor))
}
