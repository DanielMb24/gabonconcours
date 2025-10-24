-- =====================================================
-- SCRIPT COMPLET DE MISE À JOUR BASE DE DONNÉES
-- GabConcours - Système de gestion de candidatures
-- =====================================================

-- 1. TABLES DE LIAISON CONCOURS/FILIÈRES/MATIÈRES
-- =====================================================

-- Table de liaison concours <-> filières
CREATE TABLE IF NOT EXISTS `concours_filieres` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `concours_id` INT NOT NULL,
  `filiere_id` INT NOT NULL,
  `places_disponibles` INT DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_concours_filiere` (`concours_id`,`filiere_id`),
  KEY `idx_concours` (`concours_id`),
  KEY `idx_filiere` (`filiere_id`),
  CONSTRAINT `fk_concours_filieres_concours` FOREIGN KEY (`concours_id`) REFERENCES `concours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_concours_filieres_filiere` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison filière <-> matières
CREATE TABLE IF NOT EXISTS `filiere_matieres` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `filiere_id` INT NOT NULL,
  `matiere_id` INT NOT NULL,
  `coefficient` DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  `obligatoire` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_filiere_matiere` (`filiere_id`,`matiere_id`),
  KEY `idx_filiere` (`filiere_id`),
  KEY `idx_matiere` (`matiere_id`),
  CONSTRAINT `fk_filiere_matieres_filiere` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_filiere_matieres_matiere` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLE MESSAGES (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `candidat_nupcan` VARCHAR(50) NOT NULL,
  `admin_id` INT NULL,
  `sujet` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `expediteur` ENUM('candidat', 'admin') NOT NULL,
  `statut` ENUM('lu', 'non_lu') DEFAULT 'non_lu',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`candidat_nupcan`) REFERENCES `candidats`(`nupcan`) ON DELETE CASCADE,
  FOREIGN KEY (`admin_id`) REFERENCES `administrateurs`(`id`) ON DELETE SET NULL,
  INDEX idx_candidat_messages (`candidat_nupcan`),
  INDEX idx_admin_messages (`admin_id`),
  INDEX idx_statut_messages (`statut`),
  INDEX idx_created_messages (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLE NOTIFICATIONS AMÉLIORÉE
-- =====================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `candidat_nupcan` VARCHAR(50) NULL,
  `admin_id` INT NULL,
  `user_type` ENUM('candidat', 'admin', 'super_admin') NOT NULL DEFAULT 'candidat',
  `user_id` VARCHAR(50) NULL,
  `type` VARCHAR(50) NOT NULL,
  `titre` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `statut` ENUM('lu', 'non_lu') DEFAULT 'non_lu',
  `lu` BOOLEAN DEFAULT FALSE,
  `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`candidat_nupcan`) REFERENCES `candidats`(`nupcan`) ON DELETE CASCADE,
  FOREIGN KEY (`admin_id`) REFERENCES `administrateurs`(`id`) ON DELETE SET NULL,
  INDEX idx_candidat_notif (`candidat_nupcan`),
  INDEX idx_admin_notif (`admin_id`),
  INDEX idx_user_notif (`user_type`, `user_id`),
  INDEX idx_statut_notif (`statut`),
  INDEX idx_lu_notif (`lu`),
  INDEX idx_priority (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLE ADMIN_ACTIONS (traçabilité complète)
-- =====================================================
CREATE TABLE IF NOT EXISTS `admin_actions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `action_type` ENUM('validation_document', 'rejet_document', 'ajout_note', 'modification_note', 'reponse_message', 'creation_candidat', 'modification_candidat', 'suppression_candidat', 'autre') NOT NULL,
  `entity_type` VARCHAR(50) NULL,
  `entity_id` INT NULL,
  `candidat_nupcan` VARCHAR(50) NULL,
  `description` TEXT NOT NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `administrateurs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`candidat_nupcan`) REFERENCES `candidats`(`nupcan`) ON DELETE SET NULL,
  INDEX idx_admin_actions (`admin_id`),
  INDEX idx_action_type (`action_type`),
  INDEX idx_candidat_actions (`candidat_nupcan`),
  INDEX idx_created_actions (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLE PARTICIPATIONS AMÉLIORÉE
-- =====================================================
CREATE TABLE IF NOT EXISTS `participations` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `candidat_id` INT NOT NULL,
  `concours_id` INT NOT NULL,
  `filiere_id` INT NOT NULL,
  `statut` ENUM('en_attente', 'admis', 'non_admis', 'liste_attente') DEFAULT 'en_attente',
  `moyenne_generale` DECIMAL(5,2) NULL,
  `rang` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`candidat_id`) REFERENCES `candidats`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`concours_id`) REFERENCES `concours`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`filiere_id`) REFERENCES `filieres`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_participation` (`candidat_id`, `concours_id`),
  INDEX idx_concours_part (`concours_id`),
  INDEX idx_filiere_part (`filiere_id`),
  INDEX idx_statut_part (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLE NOTES AMÉLIORÉE
-- =====================================================
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `participation_id` INT NOT NULL,
  `matiere_id` INT NOT NULL,
  `note` DECIMAL(5,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`participation_id`) REFERENCES `participations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`matiere_id`) REFERENCES `matieres`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_note` (`participation_id`, `matiere_id`),
  INDEX idx_participation_notes (`participation_id`),
  CHECK (`note` >= 0 AND `note` <= 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLE SUPPORT REQUESTS (support client)
-- =====================================================
CREATE TABLE IF NOT EXISTS `support_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `requester_type` ENUM('candidat', 'admin', 'visiteur') NOT NULL,
  `requester_email` VARCHAR(255) NOT NULL,
  `requester_name` VARCHAR(255) NOT NULL,
  `requester_id` VARCHAR(50) NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `category` ENUM('technique', 'administratif', 'paiement', 'document', 'autre') NOT NULL DEFAULT 'autre',
  `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `statut` ENUM('nouveau', 'en_cours', 'resolu', 'ferme') DEFAULT 'nouveau',
  `assigned_to` INT NULL,
  `admin_response` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL,
  FOREIGN KEY (`assigned_to`) REFERENCES `administrateurs`(`id`) ON DELETE SET NULL,
  INDEX idx_statut_support (`statut`),
  INDEX idx_priority_support (`priority`),
  INDEX idx_assigned_support (`assigned_to`),
  INDEX idx_created_support (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. AJOUT D'INDEX OPTIMISÉS
-- =====================================================

-- Index pour optimiser les requêtes sur candidats
ALTER TABLE `candidats` 
ADD INDEX IF NOT EXISTS idx_concours_candidat (`concours_id`),
ADD INDEX IF NOT EXISTS idx_filiere_candidat (`filiere_id`),
ADD INDEX IF NOT EXISTS idx_created_candidat (`created_at`),
ADD INDEX IF NOT EXISTS idx_statut_candidat (`statut`);

-- Index pour optimiser les requêtes sur documents
ALTER TABLE `documents` 
ADD INDEX IF NOT EXISTS idx_statut_doc (`statut`),
ADD INDEX IF NOT EXISTS idx_type_doc (`type`),
ADD INDEX IF NOT EXISTS idx_created_doc (`created_at`);

-- Index pour optimiser les requêtes sur dossiers
ALTER TABLE `dossiers`
ADD INDEX IF NOT EXISTS idx_candidat_dossier (`candidat_id`),
ADD INDEX IF NOT EXISTS idx_concours_dossier (`concours_id`),
ADD INDEX IF NOT EXISTS idx_document_dossier (`document_id`),
ADD INDEX IF NOT EXISTS idx_nipcan_dossier (`nipcan`);

-- Index pour optimiser les requêtes sur paiements
ALTER TABLE `paiements` 
ADD INDEX IF NOT EXISTS idx_nipcan_paiement (`nipcan`),
ADD INDEX IF NOT EXISTS idx_statut_paiement (`statut`),
ADD INDEX IF NOT EXISTS idx_concours_paiement (`concours_id`),
ADD INDEX IF NOT EXISTS idx_created_paiement (`created_at`);

-- 9. AJOUTER COLONNES MANQUANTES SI NÉCESSAIRE
-- =====================================================

-- Ajouter colonne commentaire_validation si elle n'existe pas
ALTER TABLE `documents` 
ADD COLUMN IF NOT EXISTS `commentaire_validation` TEXT NULL AFTER `statut`,
ADD COLUMN IF NOT EXISTS `validated_by` INT NULL AFTER `commentaire_validation`,
ADD COLUMN IF NOT EXISTS `validated_at` TIMESTAMP NULL AFTER `validated_by`;

-- Ajouter colonne pour limitation documents par candidat
ALTER TABLE `candidats`
ADD COLUMN IF NOT EXISTS `max_documents` INT DEFAULT 10 AFTER `filiere_id`;

-- 10. INSERTION DE DONNÉES INITIALES
-- =====================================================

-- Créer des participations pour les candidats existants qui n'en ont pas
INSERT IGNORE INTO `participations` (candidat_id, concours_id, filiere_id, statut, created_at)
SELECT c.id, c.concours_id, c.filiere_id, 'en_attente', c.created_at
FROM candidats c
LEFT JOIN participations p ON c.id = p.candidat_id AND c.concours_id = p.concours_id
WHERE p.id IS NULL AND c.concours_id IS NOT NULL AND c.filiere_id IS NOT NULL;

-- 11. TRIGGERS POUR AUTOMATISATION
-- =====================================================

DELIMITER $$

-- Trigger pour créer automatiquement une participation lors de l'inscription
CREATE TRIGGER IF NOT EXISTS `after_candidat_insert`
AFTER INSERT ON `candidats`
FOR EACH ROW
BEGIN
    IF NEW.concours_id IS NOT NULL AND NEW.filiere_id IS NOT NULL THEN
        INSERT INTO participations (candidat_id, concours_id, filiere_id, statut, created_at)
        VALUES (NEW.id, NEW.concours_id, NEW.filiere_id, 'en_attente', NOW())
        ON DUPLICATE KEY UPDATE updated_at = NOW();
    END IF;
END$$

-- Trigger pour notifier lors de la validation d'un document
CREATE TRIGGER IF NOT EXISTS `after_document_update`
AFTER UPDATE ON `documents`
FOR EACH ROW
BEGIN
    IF NEW.statut != OLD.statut AND NEW.statut IN ('valide', 'rejete') THEN
        -- Récupérer le NUPCAN du candidat
        SET @nupcan = (
            SELECT dos.nipcan 
            FROM dossiers dos 
            WHERE dos.document_id = NEW.id 
            LIMIT 1
        );
        
        IF @nupcan IS NOT NULL THEN
            -- Créer une notification
            INSERT INTO notifications (
                candidat_nupcan, 
                type, 
                titre, 
                message, 
                statut, 
                priority,
                created_at
            )
            VALUES (
                @nupcan,
                'document_validation',
                CONCAT('Document ', IF(NEW.statut = 'valide', 'validé', 'rejeté')),
                CONCAT('Votre document "', NEW.nomdoc, '" a été ', IF(NEW.statut = 'valide', 'validé', 'rejeté'), '.'),
                'non_lu',
                IF(NEW.statut = 'valide', 'normal', 'high'),
                NOW()
            );
        END IF;
    END IF;
END$$

DELIMITER ;

-- 12. VUES POUR STATISTIQUES
-- =====================================================

-- Vue pour statistiques documents par statut
CREATE OR REPLACE VIEW `v_documents_stats` AS
SELECT 
    statut,
    COUNT(*) as total,
    COUNT(DISTINCT dos.nipcan) as candidats_concernes
FROM documents d
LEFT JOIN dossiers dos ON d.id = dos.document_id
GROUP BY statut;

-- Vue pour statistiques messages
CREATE OR REPLACE VIEW `v_messages_stats` AS
SELECT 
    expediteur,
    statut,
    COUNT(*) as total,
    COUNT(DISTINCT candidat_nupcan) as candidats_uniques
FROM messages
GROUP BY expediteur, statut;

-- Vue pour activité admins
CREATE OR REPLACE VIEW `v_admin_activity` AS
SELECT 
    a.id,
    a.nom,
    a.prenom,
    a.role,
    COUNT(DISTINCT aa.id) as total_actions,
    MAX(aa.created_at) as derniere_action
FROM administrateurs a
LEFT JOIN admin_actions aa ON a.id = aa.admin_id
GROUP BY a.id, a.nom, a.prenom, a.role;

-- 13. MESSAGE FINAL
-- =====================================================
SELECT '✅ Base de données mise à jour avec succès!' as message,
       'Tables créées/mises à jour:' as details_1,
       '- concours_filieres' as table_1,
       '- filiere_matieres' as table_2,
       '- messages (améliorée)' as table_3,
       '- notifications (améliorée)' as table_4,
       '- admin_actions' as table_5,
       '- support_requests' as table_6,
       '- participations (améliorée)' as table_7,
       '- notes (améliorée)' as table_8,
       'Index et triggers ajoutés' as details_2,
       'Vues statistiques créées' as details_3;
