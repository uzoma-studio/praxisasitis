// src/lib/motion.ts
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const revealFromLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const folderOpen = {
  // e.g. for Recent Posts — a slight rotate + scale, echoing the folder-tab visual motif
  hidden: { opacity: 0, scale: 0.96, rotate: -1 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}