-- ============================================
-- GABON CONCOURS - BASE DE DONNÉES COMPLÈTE
-- Version: 2.0.0
-- Date: 2024
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Suppression des tables existantes (dans l'ordre pour respecter les contraintes)
DROP TABLE IF EXISTS `filiere_matieres`;
DROP TABLE IF EXISTS `concours_filieres`;
DROP TABLE IF EXISTS `admin_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `dossiers`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `paiements`;
DROP TABLE IF EXISTS `candidats`;
DROP TABLE IF EXISTS `administrateurs`;
DROP TABLE IF EXISTS `matieres`;
DROP TABLE IF EXISTS `filieres`;
DROP TABLE IF EXISTS `concours`;
DROP TABLE IF EXISTS `etablissements`;
DROP TABLE IF EXISTS `provinces`;
DROP TABLE IF EXISTS `niveaux`;

-- ============================================
-- TABLES DE RÉFÉRENCE
-- ============================================

-- Table des provinces
CREATE TABLE `provinces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nompro` varchar(100) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nompro` (`nompro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des niveaux
CREATE TABLE `niveaux` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomniv` varchar(100) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `ordre` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomniv` (`nomniv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Table des établissements
CREATE TABLE `etablissements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nometab` varchar(255) NOT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `province_id` int DEFAULT NULL,
  `adresse` text,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `fk_etablissement_province` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des concours
CREATE TABLE `concours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomcnc` varchar(255) NOT NULL,
  `descnc` text,
  `sescnc` varchar(100) DEFAULT NULL,
  `fracnc` decimal(10,2) DEFAULT '0.00',
  `datedeb` date DEFAULT NULL,
  `datefin` date DEFAULT NULL,
  `etablissement_id` int DEFAULT NULL,
  `statut` enum('actif','termine','annule') DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `etablissement_id` (`etablissement_id`),
  CONSTRAINT `fk_concours_etablissement` FOREIGN KEY (`etablissement_id`) REFERENCES `etablissements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des filières
CREATE TABLE `filieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomfil` varchar(255) NOT NULL,
  `description` text,
  `code` varchar(20) DEFAULT NULL,
  `niveau_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomfil` (`nomfil`),
  KEY `niveau_id` (`niveau_id`),
  CONSTRAINT `fk_filiere_niveau` FOREIGN KEY (`niveau_id`) REFERENCES `niveaux` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des matières
CREATE TABLE `matieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nommat` varchar(255) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nommat` (`nommat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES DE LIAISON (MANY-TO-MANY)
-- ============================================

-- Liaison Concours <-> Filières
CREATE TABLE `concours_filieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `concours_id` int NOT NULL,
  `filiere_id` int NOT NULL,
  `places_disponibles` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_concours_filiere` (`concours_id`,`filiere_id`),
  KEY `filiere_id` (`filiere_id`),
  CONSTRAINT `fk_cf_concours` FOREIGN KEY (`concours_id`) REFERENCES `concours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cf_filiere` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Liaison Filière <-> Matières
CREATE TABLE `filiere_matieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filiere_id` int NOT NULL,
  `matiere_id` int NOT NULL,
  `coefficient` decimal(3,1) NOT NULL DEFAULT '1.0',
  `obligatoire` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_filiere_matiere` (`filiere_id`,`matiere_id`),
  KEY `matiere_id` (`matiere_id`),
  CONSTRAINT `fk_fm_filiere` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fm_matiere` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES UTILISATEURS
-- ============================================

-- Table des administrateurs
CREATE TABLE `administrateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin_etablissement') NOT NULL DEFAULT 'admin_etablissement',
  `etablissement_id` int DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `derniere_connexion` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `etablissement_id` (`etablissement_id`),
  CONSTRAINT `fk_admin_etablissement` FOREIGN KEY (`etablissement_id`) REFERENCES `etablissements` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des candidats
CREATE TABLE `candidats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nupcan` varchar(50) NOT NULL,
  `nomcan` varchar(100) NOT NULL,
  `prncan` varchar(100) NOT NULL,
  `sexcan` enum('M','F') DEFAULT NULL,
  `datcan` date DEFAULT NULL,
  `ldncan` varchar(100) DEFAULT NULL,
  `natcan` varchar(100) DEFAULT 'Gabonaise',
  `maican` varchar(100) NOT NULL,
  `telcan` varchar(20) DEFAULT NULL,
  `adrcan` text,
  `concours_id` int DEFAULT NULL,
  `filiere_id` int DEFAULT NULL,
  `niveau_id` int DEFAULT NULL,
  `phtcan` varchar(255) DEFAULT NULL,
  `statut` enum('en_attente','valide','rejete','archive') DEFAULT 'en_attente',
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nupcan` (`nupcan`),
  UNIQUE KEY `maican` (`maican`),
  KEY `concours_id` (`concours_id`),
  KEY `filiere_id` (`filiere_id`),
  KEY `niveau_id` (`niveau_id`),
  CONSTRAINT `fk_candidat_concours` FOREIGN KEY (`concours_id`) REFERENCES `concours` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_candidat_filiere` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_candidat_niveau` FOREIGN KEY (`niveau_id`) REFERENCES `niveaux` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES TRANSACTIONNELLES
-- ============================================

-- Table des paiements
CREATE TABLE `paiements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidat_id` int NOT NULL,
  `concours_id` int NOT NULL,
  `nupcan` varchar(50) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `reference` varchar(100) NOT NULL,
  `methode` varchar(50) DEFAULT NULL,
  `statut` enum('en_attente','valide','rejete','rembourse') DEFAULT 'en_attente',
  `date_paiement` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `candidat_id` (`candidat_id`),
  KEY `concours_id` (`concours_id`),
  KEY `nupcan` (`nupcan`),
  CONSTRAINT `fk_paiement_candidat` FOREIGN KEY (`candidat_id`) REFERENCES `candidats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_paiement_concours` FOREIGN KEY (`concours_id`) REFERENCES `concours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des documents
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomdoc` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `taille` int DEFAULT NULL,
  `statut` enum('en_attente','valide','rejete') DEFAULT 'en_attente',
  `commentaire_validation` text,
  `validated_by` int DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `validated_by` (`validated_by`),
  KEY `statut` (`statut`),
  CONSTRAINT `fk_document_admin` FOREIGN KEY (`validated_by`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des dossiers (liaison candidat-document-concours)
CREATE TABLE `dossiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidat_id` int NOT NULL,
  `concours_id` int NOT NULL,
  `document_id` int DEFAULT NULL,
  `nupcan` varchar(50) NOT NULL,
  `statut_dossier` varchar(50) DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidat_id` (`candidat_id`),
  KEY `concours_id` (`concours_id`),
  KEY `document_id` (`document_id`),
  KEY `nupcan` (`nupcan`),
  CONSTRAINT `fk_dossier_candidat` FOREIGN KEY (`candidat_id`) REFERENCES `candidats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dossier_concours` FOREIGN KEY (`concours_id`) REFERENCES `concours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dossier_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des notes
CREATE TABLE `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidat_id` int NOT NULL,
  `matiere_id` int NOT NULL,
  `concours_id` int NOT NULL,
  `note` decimal(5,2) DEFAULT NULL,
  `coefficient` decimal(3,1) DEFAULT '1.0',
  `note_sur` decimal(5,2) DEFAULT '20.00',
  `admin_id` int DEFAULT NULL,
  `commentaire` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidat_matiere_concours` (`candidat_id`,`matiere_id`,`concours_id`),
  KEY `matiere_id` (`matiere_id`),
  KEY `concours_id` (`concours_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `fk_note_admin` FOREIGN KEY (`admin_id`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_note_candidat` FOREIGN KEY (`candidat_id`) REFERENCES `candidats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_note_concours` FOREIGN KEY (`concours_id`) REFERENCES `concours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_note_matiere` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES DE COMMUNICATION
-- ============================================

-- Table des messages
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidat_nupcan` varchar(50) NOT NULL,
  `admin_id` int DEFAULT NULL,
  `sujet` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `expediteur` enum('candidat','admin') NOT NULL,
  `statut` enum('lu','non_lu') DEFAULT 'non_lu',
  `parent_id` int DEFAULT NULL COMMENT 'Pour les réponses',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidat_nupcan` (`candidat_nupcan`),
  KEY `admin_id` (`admin_id`),
  KEY `parent_id` (`parent_id`),
  KEY `statut` (`statut`),
  CONSTRAINT `fk_message_admin` FOREIGN KEY (`admin_id`) REFERENCES `administrateurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_message_parent` FOREIGN KEY (`parent_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des notifications
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidat_id` int NOT NULL,
  `titre` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'info',
  `lu` tinyint(1) DEFAULT '0',
  `lien` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidat_id` (`candidat_id`),
  KEY `lu` (`lu`),
  CONSTRAINT `fk_notification_candidat` FOREIGN KEY (`candidat_id`) REFERENCES `candidats` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLES DE TRAÇABILITÉ
-- ============================================

-- Table des logs administrateur
CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `table_name` (`table_name`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `fk_log_admin` FOREIGN KEY (`admin_id`) REFERENCES `administrateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INDEX SUPPLÉMENTAIRES POUR LES PERFORMANCES
-- ============================================

CREATE INDEX `idx_candidat_statut` ON `candidats` (`statut`);
CREATE INDEX `idx_document_statut` ON `documents` (`statut`);
CREATE INDEX `idx_paiement_statut` ON `paiements` (`statut`);
CREATE INDEX `idx_message_statut_expediteur` ON `messages` (`statut`, `expediteur`);
CREATE INDEX `idx_dossier_nupcan_concours` ON `dossiers` (`nupcan`, `concours_id`);

-- ============================================
-- DONNÉES D'EXEMPLE / SEED
-- ============================================

-- Provinces
INSERT INTO `provinces` (`nompro`, `code`) VALUES
('Estuaire', 'EST'),
('Haut-Ogooué', 'HO'),
('Moyen-Ogooué', 'MO'),
('Ngounié', 'NGO'),
('Nyanga', 'NYA'),
('Ogooué-Ivindo', 'OI'),
('Ogooué-Lolo', 'OL'),
('Ogooué-Maritime', 'OM'),
('Woleu-Ntem', 'WN');

-- Niveaux
INSERT INTO `niveaux` (`nomniv`, `code`, `ordre`) VALUES
('Licence 1', 'L1', 1),
('Licence 2', 'L2', 2),
('Licence 3', 'L3', 3),
('Master 1', 'M1', 4),
('Master 2', 'M2', 5),
('Doctorat', 'DOC', 6);

-- Super Admin par défaut (mot de passe: admin123)
INSERT INTO `administrateurs` (`nom`, `prenom`, `email`, `password`, `role`) VALUES
('Admin', 'Super', 'superadmin@gabon-concours.ga', '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'super_admin');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
