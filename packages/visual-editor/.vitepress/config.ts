import { copyFileSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { defineConfig } from "vitepress";
import matter from "gray-matter"; // Add gray-matter to parse frontmatter

// Type for sidebar items
interface SidebarItem {
  text: string;
  link: string;
}
const specialFolders = ["docs"] as const;
type specialFoldersType = (typeof specialFolders)[number];

// Function to recursively find all Markdown files in a directory
const getMarkdownFiles = (
  dir: string,
  folder?: specialFoldersType
): string[] => {
  let markdownFiles: string[] = [];

  try {
    const files = readdirSync(dir);
    for (const file of files) {
      const fullPath = join(dir, file);
      // if not reading a from a special folder (ie all of src), then skip returning the md files in those special folders
      if (
        !folder &&
        specialFolders.some((f) => basename(dirname(fullPath)) === f)
      ) {
        continue;
      }
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        markdownFiles = markdownFiles.concat(getMarkdownFiles(fullPath));
      } else if (file.endsWith(".md")) {
        const relativePath = fullPath.replace(baseDir + "/", "");
        markdownFiles.push(relativePath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err}`);
  }

  return markdownFiles;
};

// Function to get the title from frontmatter or fallback to filename
const getTitleFromFile = (filePath: string): string => {
  const fullPath = join(baseDir, filePath);
  const fileContent = readFileSync(fullPath, "utf-8");
  const { data } = matter(fileContent);
  return data.title || filePath.split("/").pop()!.replace(".md", "");
};

// Define the base directory
const baseDir = resolve(__dirname, "..", "src"); // packages/visual-editor

// Generate sidebar items for a given folder
const generateSidebarItems = (folder?: specialFoldersType): SidebarItem[] => {
  const dir = folder ? join(baseDir, folder) : baseDir;
  const files = getMarkdownFiles(dir, folder);

  return files
    .map((file) => {
      const path = `/${file.replace(".md", "")}`; // Convert to URL path
      const title = getTitleFromFile(file);
      return { text: title, link: path };
    })
    .sort((a, b) => a.text.localeCompare(b.text));
};

const DIST_DIR = `dist`;

const copyArtifactsPlugin = () => {
  return {
    name: "copy-artifacts",
    writeBundle() {
      const source = resolve(__dirname, "../artifacts.json");
      const dest = resolve(
        __dirname,
        "..",
        "..",
        "..",
        DIST_DIR,
        "artifacts.json"
      );

      try {
        copyFileSync(source, dest);
        console.log("Copied artifacts.json to .vitepress/dist/");
      } catch (err) {
        console.error("Failed to copy artifacts.json:", err);
      }
    },
  };
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "src",
  srcExclude: ["CHANGELOG.md", "DEVELOPMENT.md"],
  outDir: "../../dist",
  cleanUrls: true,
  title: "Visual Editor",
  description: "Visually edit your layouts for Yext Pages",
  themeConfig: {
    siteTitle: "Visual Editor",
    logo: "/logo.svg",
    logoLink: "/",
    search: {
      provider: "local",
    },
    nav: [
      { text: "Guides", link: "/docs/getting-started" },
      { text: "Docs", link: "/editor/README" },
    ],

    sidebar: [
      {
        text: "Guides",
        items: generateSidebarItems("docs").filter(
          (item) => !item.link.includes("index")
        ),
      },
      {
        text: "Reference",
        items: generateSidebarItems(),
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/yext/visual-editor" },
    ],
  },
  rewrites: {
    "docs/index.md": "index.md",
  },
  vite: {
    plugins: [copyArtifactsPlugin()],
  },
});
