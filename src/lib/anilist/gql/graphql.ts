/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** The format the media was released in */
export type MediaFormat =
  /** Professionally published manga with more than one chapter */
  | 'MANGA'
  /** Anime movies with a theatrical release */
  | 'MOVIE'
  /** Short anime released as a music video */
  | 'MUSIC'
  /** Written books released as a series of light novels */
  | 'NOVEL'
  /** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
  | 'ONA'
  /** Manga with just one chapter */
  | 'ONE_SHOT'
  /** (Original Video Animation) Anime that have been released directly on DVD/Blu-ray without originally going through a theatrical release or television broadcast */
  | 'OVA'
  /** Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc */
  | 'SPECIAL'
  /** Anime broadcast on television */
  | 'TV'
  /** Anime which are under 15 minutes in length and broadcast on television */
  | 'TV_SHORT';

/** Type of relation media has to its parent. */
export type MediaRelation =
  /** An adaption of this media into a different format */
  | 'ADAPTATION'
  /** An alternative version of the same media */
  | 'ALTERNATIVE'
  /** Shares at least 1 character */
  | 'CHARACTER'
  /** Version 2 only. */
  | 'COMPILATION'
  /** Version 2 only. */
  | 'CONTAINS'
  /** Other */
  | 'OTHER'
  /** The media a side story is from */
  | 'PARENT'
  /** Released before the relation */
  | 'PREQUEL'
  /** Released after the relation */
  | 'SEQUEL'
  /** A side story of the parent media */
  | 'SIDE_STORY'
  /** Version 2 only. The source material the media was adapted from */
  | 'SOURCE'
  /** An alternative version of the media with a different primary focus */
  | 'SPIN_OFF'
  /** A shortened and summarized version */
  | 'SUMMARY';

export type MediaSeason =
  /** Predominantly started airing between October and November */
  | 'FALL'
  /** Predominantly started airing between April and June */
  | 'SPRING'
  /** Predominantly started airing between July and September */
  | 'SUMMER'
  /** Predominantly started airing between January and March */
  | 'WINTER';

/** Media sort enums */
export type MediaSort =
  | 'CHAPTERS'
  | 'CHAPTERS_DESC'
  | 'DURATION'
  | 'DURATION_DESC'
  | 'END_DATE'
  | 'END_DATE_DESC'
  | 'EPISODES'
  | 'EPISODES_DESC'
  | 'FAVOURITES'
  | 'FAVOURITES_DESC'
  | 'FORMAT'
  | 'FORMAT_DESC'
  | 'ID'
  | 'ID_DESC'
  | 'POPULARITY'
  | 'POPULARITY_DESC'
  | 'SCORE'
  | 'SCORE_DESC'
  | 'SEARCH_MATCH'
  | 'START_DATE'
  | 'START_DATE_DESC'
  | 'STATUS'
  | 'STATUS_DESC'
  | 'TITLE_ENGLISH'
  | 'TITLE_ENGLISH_DESC'
  | 'TITLE_NATIVE'
  | 'TITLE_NATIVE_DESC'
  | 'TITLE_ROMAJI'
  | 'TITLE_ROMAJI_DESC'
  | 'TRENDING'
  | 'TRENDING_DESC'
  | 'TYPE'
  | 'TYPE_DESC'
  | 'UPDATED_AT'
  | 'UPDATED_AT_DESC'
  | 'VOLUMES'
  | 'VOLUMES_DESC';

/** The current releasing status of the media */
export type MediaStatus =
  /** Ended before the work could be finished */
  | 'CANCELLED'
  /** Has completed and is no longer being released */
  | 'FINISHED'
  /** Version 2 only. Is currently paused from releasing and will resume at a later date */
  | 'HIATUS'
  /** To be released at a later date */
  | 'NOT_YET_RELEASED'
  /** Currently releasing */
  | 'RELEASING';

/** Media type enum, anime or manga. */
export type MediaType =
  /** Japanese Anime */
  | 'ANIME'
  /** Asian comic */
  | 'MANGA';

export type MediaCardFieldsFragment = { id: number, format: MediaFormat | null, averageScore: number | null, seasonYear: number | null, genres: Array<string | null> | null, episodes: number | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null };

export type HeroFieldsFragment = { id: number, bannerImage: string | null, description: string | null, genres: Array<string | null> | null, format: MediaFormat | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null };

export type HomeQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeQuery = { featured: { media: Array<{ id: number, bannerImage: string | null, description: string | null, genres: Array<string | null> | null, format: MediaFormat | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null } | null> | null } | null, airing: { media: Array<{ id: number, format: MediaFormat | null, averageScore: number | null, seasonYear: number | null, genres: Array<string | null> | null, episodes: number | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null } | null> | null } | null, trending: { media: Array<{ id: number, format: MediaFormat | null, averageScore: number | null, seasonYear: number | null, genres: Array<string | null> | null, episodes: number | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null } | null> | null } | null, upcoming: { media: Array<{ id: number, format: MediaFormat | null, averageScore: number | null, seasonYear: number | null, genres: Array<string | null> | null, episodes: number | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null } | null> | null } | null };

export type AnimeDetailQueryVariables = Exact<{
  id: number;
}>;


export type AnimeDetailQuery = { Media: { id: number, description: string | null, bannerImage: string | null, format: MediaFormat | null, status: MediaStatus | null, episodes: number | null, duration: number | null, season: MediaSeason | null, seasonYear: number | null, averageScore: number | null, meanScore: number | null, popularity: number | null, favourites: number | null, genres: Array<string | null> | null, title: { romaji: string | null, english: string | null, native: string | null } | null, coverImage: { extraLarge: string | null, color: string | null } | null, studios: { nodes: Array<{ id: number, name: string } | null> | null } | null, trailer: { id: string | null, site: string | null } | null, externalLinks: Array<{ id: number, url: string | null, site: string } | null> | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null, relations: { edges: Array<{ relationType: MediaRelation | null, node: { id: number, type: MediaType | null, title: { romaji: string | null } | null, coverImage: { large: string | null } | null } | null } | null> | null } | null } | null };

export type BrowseQueryVariables = Exact<{
  page?: number | null | undefined;
  sort?: Array<MediaSort | null | undefined> | MediaSort | null | undefined;
  status?: MediaStatus | null | undefined;
  season?: MediaSeason | null | undefined;
  seasonYear?: number | null | undefined;
  genre?: string | null | undefined;
  format?: MediaFormat | null | undefined;
  search?: string | null | undefined;
}>;


export type BrowseQuery = { Page: { pageInfo: { hasNextPage: boolean | null, currentPage: number | null } | null, media: Array<{ id: number, format: MediaFormat | null, averageScore: number | null, seasonYear: number | null, genres: Array<string | null> | null, episodes: number | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null, nextAiringEpisode: { episode: number, airingAt: number, timeUntilAiring: number } | null } | null> | null } | null };

export type ScheduleQueryVariables = Exact<{
  start: number;
  end: number;
  page?: number | null | undefined;
}>;


export type ScheduleQuery = { Page: { pageInfo: { hasNextPage: boolean | null, currentPage: number | null } | null, airingSchedules: Array<{ id: number, airingAt: number, episode: number, media: { id: number, format: MediaFormat | null, isAdult: boolean | null, title: { romaji: string | null, english: string | null } | null, coverImage: { large: string | null, color: string | null } | null } | null } | null> | null } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const MediaCardFieldsFragmentDoc = new TypedDocumentString(`
    fragment MediaCardFields on Media {
  id
  title {
    romaji
    english
  }
  coverImage {
    large
    color
  }
  format
  averageScore
  seasonYear
  genres
  episodes
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
}
    `, {"fragmentName":"MediaCardFields"}) as unknown as TypedDocumentString<MediaCardFieldsFragment, unknown>;
export const HeroFieldsFragmentDoc = new TypedDocumentString(`
    fragment HeroFields on Media {
  id
  title {
    romaji
    english
  }
  bannerImage
  coverImage {
    large
    color
  }
  description(asHtml: false)
  genres
  format
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
}
    `, {"fragmentName":"HeroFields"}) as unknown as TypedDocumentString<HeroFieldsFragment, unknown>;
export const HomeDocument = new TypedDocumentString(`
    query Home {
  featured: Page(page: 1, perPage: 6) {
    media(status: RELEASING, sort: TRENDING_DESC, type: ANIME, isAdult: false) {
      ...HeroFields
    }
  }
  airing: Page(page: 1, perPage: 12) {
    media(status: RELEASING, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
      ...MediaCardFields
    }
  }
  trending: Page(page: 1, perPage: 12) {
    media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
      ...MediaCardFields
    }
  }
  upcoming: Page(page: 1, perPage: 12) {
    media(
      status: NOT_YET_RELEASED
      sort: POPULARITY_DESC
      type: ANIME
      isAdult: false
    ) {
      ...MediaCardFields
    }
  }
}
    fragment MediaCardFields on Media {
  id
  title {
    romaji
    english
  }
  coverImage {
    large
    color
  }
  format
  averageScore
  seasonYear
  genres
  episodes
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
}
fragment HeroFields on Media {
  id
  title {
    romaji
    english
  }
  bannerImage
  coverImage {
    large
    color
  }
  description(asHtml: false)
  genres
  format
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
}`) as unknown as TypedDocumentString<HomeQuery, HomeQueryVariables>;
export const AnimeDetailDocument = new TypedDocumentString(`
    query AnimeDetail($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      extraLarge
      color
    }
    bannerImage
    format
    status
    episodes
    duration
    season
    seasonYear
    averageScore
    meanScore
    popularity
    favourites
    genres
    studios(isMain: true) {
      nodes {
        id
        name
      }
    }
    trailer {
      id
      site
    }
    externalLinks {
      id
      url
      site
    }
    nextAiringEpisode {
      episode
      airingAt
      timeUntilAiring
    }
    relations {
      edges {
        relationType
        node {
          id
          type
          title {
            romaji
          }
          coverImage {
            large
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AnimeDetailQuery, AnimeDetailQueryVariables>;
export const BrowseDocument = new TypedDocumentString(`
    query Browse($page: Int = 1, $sort: [MediaSort] = [POPULARITY_DESC], $status: MediaStatus, $season: MediaSeason, $seasonYear: Int, $genre: String, $format: MediaFormat, $search: String) {
  Page(page: $page, perPage: 24) {
    pageInfo {
      hasNextPage
      currentPage
    }
    media(
      sort: $sort
      status: $status
      season: $season
      seasonYear: $seasonYear
      genre: $genre
      format: $format
      search: $search
      type: ANIME
      isAdult: false
    ) {
      ...MediaCardFields
    }
  }
}
    fragment MediaCardFields on Media {
  id
  title {
    romaji
    english
  }
  coverImage {
    large
    color
  }
  format
  averageScore
  seasonYear
  genres
  episodes
  nextAiringEpisode {
    episode
    airingAt
    timeUntilAiring
  }
}`) as unknown as TypedDocumentString<BrowseQuery, BrowseQueryVariables>;
export const ScheduleDocument = new TypedDocumentString(`
    query Schedule($start: Int!, $end: Int!, $page: Int = 1) {
  Page(page: $page, perPage: 50) {
    pageInfo {
      hasNextPage
      currentPage
    }
    airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
      id
      airingAt
      episode
      media {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
          color
        }
        format
        isAdult
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ScheduleQuery, ScheduleQueryVariables>;