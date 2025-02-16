import React from "react";
import styles from "./ElectricalModule.module.css";

export interface BaseElectricalModuleProps {
  size: number;
  className?: string;
  backColorClassName?: string;
  protrusionColorClassName?: string;
  children?: React.ReactNode;
}

const BaseElectricalModule: React.FC<BaseElectricalModuleProps> = ({
  size,
  className,
  backColorClassName,
  protrusionColorClassName,
  children,
}) => {
  const screwCount = Math.max(4, size * 2);

  return (
    <div
      className={`${styles.module} ${className}`}
      style={{ "--size": size } as React.CSSProperties}
    >
      <div className={`${styles.back} ${backColorClassName}`}>
        <div className={styles.screwContainer}>
          {[...Array(Math.ceil(screwCount / 2))].map((_, index) => (
            <div key={`top-${index}`} className={styles.screw}></div>
          ))}
        </div>
        <div className={`${styles.protrusion} ${protrusionColorClassName}`}>
          {children}
        </div>
        <div className={styles.screwContainer}></div>
      </div>
    </div>
  );
};

export default BaseElectricalModule;
