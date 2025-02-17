import Github from "@/assets/github.svg";
import Twitter from "@/assets/twitter.svg";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl font-bold">Hydra Theme Store</h3>
            <p className="mt-2 text-sm">
              {new Date().getFullYear()} &copy; Hydra Launcher.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/hydralauncher/hydra"
              className="transition-colors hover:text-white"
            >
              <span className="sr-only">GitHub</span>
              <img
                src={Github.src}
                alt="GitHub"
                width={32}
                height={32}
                decoding="async"
                loading="lazy"
                className="dark:invert"
              />
            </a>
            <a
              href="https://x.com/hydralauncher"
              className="transition-colors hover:text-white"
            >
              <span className="sr-only">Twitter</span>
              <img
                src={Twitter.src}
                alt="Twitter"
                width={28}
                height={28}
                decoding="async"
                loading="lazy"
                className="dark:invert"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
