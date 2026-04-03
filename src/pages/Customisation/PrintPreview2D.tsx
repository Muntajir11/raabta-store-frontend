import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import frontUrl from '../../assets/customisation/front.png';
import backUrl from '../../assets/customisation/back.png';
import sideUrl from '../../assets/customisation/side.png';
import type { PrintTemplate } from './printPositions';
import { getPrintPosition } from './printPositions';

const TEMPLATE_SRC: Record<PrintTemplate, string> = {
  front: frontUrl,
  back: backUrl,
  'profile-left': sideUrl,
  'profile-right': sideUrl,
};

export type PrintPreview2DProps = {
  artPositionId: string;
  textPositionId: string;
  artworkUrl: string | null;
  showArtwork: boolean;
  customText: string;
  artworkScale: number;
  forcedTemplate?: PrintTemplate;
};

function primaryTemplate(
  showArtwork: boolean,
  hasArtUrl: boolean,
  artTemplate: PrintTemplate | undefined,
  textTemplate: PrintTemplate | undefined,
): PrintTemplate {
  if (showArtwork && hasArtUrl && artTemplate) return artTemplate;
  if (textTemplate) return textTemplate;
  return 'front';
}

const SlotBox: FC<{
  area: { topPct: number; leftPct: number; widthPct: number; heightPct: number };
  children: ReactNode;
  isText?: boolean;
}> = ({ area, children, isText }) => (
  <div
    className={`tee-print-slot${isText ? ' tee-print-slot--text' : ''}`}
    style={{
      top: `${area.topPct}%`,
      left: `${area.leftPct}%`,
      width: `${area.widthPct}%`,
      height: `${area.heightPct}%`,
    }}
  >
    {children}
  </div>
);

export const PrintPreview2D: FC<PrintPreview2DProps> = ({
  artPositionId,
  textPositionId,
  artworkUrl,
  showArtwork,
  customText,
  artworkScale,
  forcedTemplate,
}) => {
  const artPos = getPrintPosition(artPositionId);
  const textPos = getPrintPosition(textPositionId);
  const hasArtUrl = Boolean(artworkUrl);

  const template = useMemo(
    () => forcedTemplate ?? primaryTemplate(showArtwork, hasArtUrl, artPos?.template, textPos?.template),
    [forcedTemplate, showArtwork, hasArtUrl, artPos?.template, textPos?.template],
  );

  const templateSrc = TEMPLATE_SRC[template];

  const showArtSlot =
    showArtwork && artPos && artPos.template === template;
  const showTextSlot = Boolean(customText.trim()) && textPos && textPos.template === template;

  const clampedScale = Math.max(0.25, Math.min(artworkScale, 1.35));

  return (
    <div className="print-preview-2d">
      <div className="tee-template-viewport" aria-label="T-shirt print preview">
        <div className="tee-garment-frame">
          <img
            src={templateSrc}
            alt=""
            className={`tee-template-img${template === 'back' ? ' tee-template-img--back' : ''}${
              template === 'profile-right' ? ' tee-template-img--mirror' : ''
            }`}
            draggable={false}
          />
          <div className={`tee-print-layer tee-print-layer--${template}`}>
            {showArtSlot ? (
              <SlotBox area={artPos.area}>
                <div
                  className="tee-guide-box tee-guide-box--art"
                  style={{ transform: `scale(${clampedScale})` }}
                  aria-label="Artwork placement guide"
                >
                  <span>Your Image</span>
                </div>
              </SlotBox>
            ) : null}
            {showTextSlot ? (
              <SlotBox area={textPos.area} isText>
                <div className="tee-guide-box tee-guide-box--text" aria-label="Text placement guide">
                  <span>Text</span>
                </div>
              </SlotBox>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
