import React from 'react';
import {PlusIcon} from 'lucide-react';
import BaseElectricalModule from './BaseElectricalModule';
import styles from './ElectricalModule.module.css';
import {Size} from "@/app/types/Unit";

export interface AddElectricalModuleProps {
    size: Size;
    onClick: () => void;
    className?: string;
}

const AddElectricalModule: React.FC<AddElectricalModuleProps> = ({
                                                                     size,
                                                                     onClick,
                                                                     className
                                                                 }) => {
    return (
        <BaseElectricalModule
            size={size}
            className={`${className} tour-unit-add-customization mr-4`}
            backColorClassName={styles.backColorAdd}
            protrusionColorClassName={styles.protrusionColorAdd}
        >
            <button onClick={onClick} className={styles.addButton} aria-label="Add new module">
                <PlusIcon size={24}/>
            </button>
        </BaseElectricalModule>
    );
};

export default AddElectricalModule;