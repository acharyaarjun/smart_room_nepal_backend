import slugify from "slugify";
import { Model, ModelCtor } from "sequelize-typescript";
import { Op } from "sequelize";

export const slugifyString = (str: string): string => {
  return slugify(str, {
    remove: /[*+~.()'"!:@]/g,
    replacement: "-",
    lower: true,
    trim: true,
  });
};

export const generateSlug = (len: number): string => {
  // return nanoid(len);
  return (
    "xyz" +
    Math.random()
      .toString(36)
      .substring(2, len + 3)
      .toLowerCase()
  );
};

export const generateUniqueSlug = async ({
  model,
  text,
  id,
}: {
  model: ModelCtor<Model>;
  text: string;
  id?: string;
}): Promise<string> => {
  // if text is too long, truncate it
  if (text.length > 80) {
    text = text.slice(0, 80);
  }

  const slug = slugifyString(text);

  const existing = await model.findOne({
    where: {
      slug,
      ...(id && {
        id: {
          [Op.ne]: id,
        },
      }),
    },
  });

  if (!existing) {
    return slug;
  }

  const newSlug = `${slug}-${generateSlug(6)}`;

  // check slug length if it is not empty
  if (newSlug.length < 6) {
    return generateSlug(6);
  }

  return newSlug;
};
