import React from 'react';
import Link from 'next/link';

import styles from './button.module.css';

function Button({
  href,
  children,
  ...delegated
}) {
  const Tag = typeof href === 'string'
    ? Link
    : 'button';

  return (
    <Tag
      href={href}
      className={styles.button}
      {...delegated}
    >
      {children}
    </Tag>
  );
}

export default Button;
