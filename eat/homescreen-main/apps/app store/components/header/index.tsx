import { Link } from "preact-router/match";
import { Icon } from "../icon";

const Header = () => (
  <header class="row px-6 py-4 aic">
    <Link href="/" class="text-(2xl neutral-800) font-bold w-full">
      First Listen
    </Link>
    <Icon id="person-crop-circle" size="8" fill="neutral-800" />
  </header>
);

export default Header;
