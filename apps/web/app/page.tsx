import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.viewport}>
      <div className={styles.scene}>
        <img src="/sprites/sky-layer.png" alt="" className={`${styles.layer} ${styles.sky}`} />
        <img
          src="/sprites/skyline-layer.png"
          alt=""
          className={`${styles.layer} ${styles.skyline}`}
        />
        <img
          src="/sprites/treeline-layer.png"
          alt=""
          className={`${styles.layer} ${styles.treeline}`}
        />
        <img src="/sprites/tree-layer.png" alt="" className={`${styles.layer} ${styles.tree}`} />
        <img
          src="/sprites/table-character-layer.png"
          alt=""
          className={`${styles.layer} ${styles.table}`}
        />
        <img
          src="/sprites/grass-layer.png"
          alt=""
          className={`${styles.layer} ${styles.grass}`}
        />

        <img src="/sprites/leaf-particle-1.png" alt="" className={`${styles.leaf} ${styles.leaf1}`} />
        <img src="/sprites/leaf-particle-1.png" alt="" className={`${styles.leaf} ${styles.leaf2}`} />
        <img src="/sprites/leaf-particle-1.png" alt="" className={`${styles.leaf} ${styles.leaf3}`} />
        <img src="/sprites/leaf-particle-1.png" alt="" className={`${styles.leaf} ${styles.leaf4}`} />
        <img src="/sprites/leaf-particle-1.png" alt="" className={`${styles.leaf} ${styles.leaf5}`} />
      </div>
    </div>
  );
}
