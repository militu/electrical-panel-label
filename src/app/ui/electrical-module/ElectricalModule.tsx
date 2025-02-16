// src/app/ui/electrical-module/ElectricalModule.tsx
import Image from "next/image";
import React from "react";
import BaseElectricalModule from "./BaseElectricalModule";
import styles from "./ElectricalModule.module.css";

export interface ElectricalModuleProps {
  size: number;
  logo?: string;
  logoData?: string; // Add logoData prop
  description?: string;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  sidebarColor?: string;
}

const ElectricalModule: React.FC<ElectricalModuleProps> = ({
  size,
  logo,
  logoData, // Receive logoData
  description,
  className,
  backgroundColor = "#f0f0f0",
  textColor = "#000000",
  sidebarColor = "#007bff",
}) => {
  return (
    <BaseElectricalModule
      size={size}
      className={`${className} tour-unit-management`}
    >
      <div className={styles.moduleContainer}>
        <div className={styles.logoContainer}>
          {logoData ? (
            // Custom icon: Use data URL
            <Image
              src={logoData}
              alt={logo || "Custom Icon"} // Use logo ID/name as alt text
              width={32}
              height={32}
              className={styles.logo}
            />
          ) : logo ? (
            // Built-in icon: Use /icons/ path
            <Image
              src={`/icons/${logo}.svg`}
              alt={logo}
              width={32}
              height={32}
              className={styles.logo}
            />
          ) : (
            <div className={styles.placeholder}>
              <span></span>
            </div>
          )}
        </div>
        {description && (
          <div className={styles.descriptionWrapper}>
            <div
              className={styles.sidebarColor}
              style={{ backgroundColor: sidebarColor }}
            ></div>
            <div
              className={styles.descriptionContainer}
              style={{ backgroundColor, color: textColor }}
            >
              <p className={styles.description}>{description}</p>
            </div>
          </div>
        )}
      </div>
    </BaseElectricalModule>
  );
};

export default ElectricalModule;
