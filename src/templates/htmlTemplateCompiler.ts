import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { rootDir } from "@/utils/fileStorageUtil";

const templatesDir = path.join(rootDir, "src", "templates", "views");

const htmlTemplateCompiler = ({
  templateName,
  data,
}: {
  templateName: string;
  data: any;
}): string => {
  const template = fs.readFileSync(
    path.join(templatesDir, `${templateName}.hbs`),
    "utf8"
  );

  const compiledTemplate = Handlebars.compile(template);

  return compiledTemplate(data);
};

export default htmlTemplateCompiler;
