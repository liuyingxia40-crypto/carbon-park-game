import { useState } from 'react';
import { gameBridge } from '../game/bridge';
import { BUILDINGS, type BuildingId } from '../game/buildings';
import type { SuperBuildingId } from '../game/superBuildings';
import { BuildingThumb } from './BuildingThumb';

export const TOWN_BUILD_IDS: BuildingId[] = ['thermal_plant', 'steel_mill', 'solar_plant'];

type Props = {
  placing: BuildingId | SuperBuildingId | null;
};

export function BuildRail({ placing }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <aside className="build-rail">
      <button
        type="button"
        className="build-rail__tab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        BUILD
      </button>
      {open && (
        <div className="build-rail__panel">
          <div className="build-rail__list">
            {TOWN_BUILD_IDS.map((id) => (
              <BuildBtn key={id} id={id} placing={placing} />
            ))}
          </div>
          {placing && (
            <button type="button" className="build-rail__cancel" onClick={() => gameBridge.cancelBuild()}>
              取消
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

function BuildBtn({
  id,
  placing,
}: {
  id: BuildingId;
  placing: BuildingId | SuperBuildingId | null;
}) {
  const def = BUILDINGS[id];
  const active = placing === id;

  return (
    <button
      type="button"
      className={`build-btn${active ? ' build-btn--active' : ''}`}
      title={`${def.name} ¥${def.cost}`}
      onClick={() => gameBridge.selectBuild(id)}
    >
      <BuildingThumb buildingId={id} size={40} />
      <span className="build-btn__name">{def.name}</span>
    </button>
  );
}
