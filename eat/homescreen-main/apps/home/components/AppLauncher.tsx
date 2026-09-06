import { Launcher } from "../../../components/Launcher";
import { AppIcon } from "./AppIcon";
import { Lazy } from "../../../components/Lazy";
import { App } from "../state/apps";

interface AppLauncherProps {
  app: App;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({ app }) => (
  <Launcher
    id={app.id}
    placeholder={() => <AppIcon app={app} />}
    window={(props) => (
      <>
        <Lazy key={app.id} mod={app.mod} />
        <button class="fixed bottom-0 h-10 w-full z-10" onClick={props.home} />
      </>
    )}
  />
);
