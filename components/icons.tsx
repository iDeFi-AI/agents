import React from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { 
  faSearchDollar, 
  faShieldAlt, 
  faChartLine, 
  faKey, 
  faBolt,  // Replacing dollar sign with lightning bolt
  faBalanceScale, 
  faUserTie, 
  faFileContract, 
  faPiggyBank, 
  faClipboardList,
  faHeart,
  faStar, 
  faPlus,
  faCopy,
  faMedal,   // Added for Agent+
  faAtom,
  faMoneyBill1,
  faTriangleExclamation,
  faRobot,
  faIdCard,
  faBell,
  faInfoCircle,
  faChevronDown,
  faChevronUp // Added for Quantum Agents
} from '@fortawesome/free-solid-svg-icons';

interface IconProps extends Omit<FontAwesomeIconProps, 'icon'> {}

export const AnalysisIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faSearchDollar} {...props} />
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faShieldAlt} {...props} />
);

export const GraphIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faChartLine} {...props} />
);

export const KeyIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faKey} {...props} />
);

export const LightningIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faBolt} {...props} />  // Lightning bolt icon for upgrade plan
);

export const BalanceIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faBalanceScale} {...props} />
);

export const AdvisorIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faUserTie} {...props} />
);

export const ContractIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faFileContract} {...props} />
);

export const SavingsIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faPiggyBank} {...props} />
);

export const ChecklistIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faClipboardList} {...props} />
);

export const HeartIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faHeart} {...props} />
);

export const StarIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faStar} {...props} />
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faPlus} {...props} />
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faCopy} {...props} />
);

export const MedalIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faMedal} {...props} /> // Medal icon for Agent+
);

export const AtomIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faAtom} {...props} /> // Atom icon for Quantum Agents
);

export const MoneyIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faMoneyBill1} {...props} /> // Atom icon for Quantum Agents
);

export const Alert: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faTriangleExclamation} {...props} />

);

export const Robot: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faRobot} {...props} />

);

export const IdCard: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faIdCard} {...props} />

);

export const Bell: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faBell} {...props} />

);

export const Info: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faInfoCircle} {...props} />

);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faChevronDown} {...props} />

);

export const ChevronUpIcon: React.FC<IconProps> = (props) => (
  <FontAwesomeIcon icon={faChevronUp} {...props} />

);