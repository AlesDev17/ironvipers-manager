from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.clients.schemas import ClientCreate, ClientResponse, ClientUpdate
from app.modules.clients.service import ClientService
from app.shared.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
def list_clients(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return ClientService(db).list_clients()


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    data: ClientCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return ClientService(db).create_client(data)


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return ClientService(db).get_client(client_id)


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: uuid.UUID,
    data: ClientUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return ClientService(db).update_client(client_id, data)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    ClientService(db).delete_client(client_id)
