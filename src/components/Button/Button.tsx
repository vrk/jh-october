import React from 'react';
import Link from 'next/link';

import styles from './button.module.css';
import { Url } from 'url';

type Props = {
  href?: string;
  onClick?: () => void;
}

function Button({
  href,
  onClick,
  children,
  ...delegated
}: React.PropsWithChildren<Props>) {
  if (href) {
    return <Link href={href} className={styles.button} {...delegated}>{children}</Link>
  } else {
    return <button onClick={onClick} className={styles.button} {...delegated}>{children}</button>
  }
}

export default Button;
